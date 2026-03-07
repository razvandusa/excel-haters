import cv2
import numpy as np
import re
import easyocr
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

USE_GPU = False  # set True if GPU available on server

app = FastAPI()
reader = easyocr.Reader(['en'], gpu=USE_GPU)  # I dont think its necessary romanian because it detects only one letter
                                 # gpu (bool): Enable GPU support (default)   maybe increase speed?
                                 # gpu=False, a single photo might take 3 to 8 seconds to process.

def preprocess_image(image_bytes: bytes):
    # Converts to grayscale and applies thresholding to make text pop out. 
    # Convert bytes to numpy array, then to OpenCV image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image. Ensure it is a valid JPEG or PNG file.")
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Increase contrast / Thresholding (Otsu's method handles varied lighting well)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Full perspective transform requires detecting the paper's corners first, 
    # which we can add later if users upload heavily angled photos.
    return thresh

def parse_ocr_text(raw_text_list: list):
    components = []
    
    # Pattern: Looks for D, SC, G, or S followed immediately by numbers or letters (eg. D1, SC2 etc.)
    # We use ^ and $ to ensure we match the whole string without random trailing garbage
    pattern = re.compile(r"^(D|SC|G|S)([A-Z0-9]+)$")   
    
    for text in raw_text_list:
        # Clean common OCR mistakes before regex matching 
        # (e.g., removing spaces, fixing 'l' or 'I' read as '1')
        clean_text = text.replace(" ", "").upper()
        clean_text = clean_text.replace("L", "1").replace("I", "1") 
        # maybe other mistakes? we can fix later if needed 
        
        match = pattern.match(clean_text)
        
        if match:
            prefix = match.group(1)
            number = match.group(2)
            
            # Map the prefix to the backend Component Type enum
            if prefix == "D":
                comp_type = "DESK"
            elif prefix == "SC":
                comp_type = "SECURITY CHECK"
            elif prefix == "G":
                comp_type = "GATE"
            elif prefix == "S":
                comp_type = "STAND"
            else:
                continue  # This should never happen due to regex, but just in case
                
            components.append({
                "type": comp_type,
                "name": number # Just sending the number as requested
            })
            
    return components

@app.post("/components/import")
async def extract_components_from_layout(file: UploadFile = File(...)):
    # API Endpoint to receive photo and return JSON
    try:
        # Read the uploaded image file
        image_bytes = await file.read()
        
        # 1. Preprocess the image (OpenCV)
        processed_img = preprocess_image(image_bytes)
        
        # 2. Run EasyOCR (returns a list of tuples: (bbox, text, confidence))
        # detail=0 returns just the text strings
        ocr_results = reader.readtext(processed_img, detail=0) 
        
        # 3. Parse text into structured components
        structured_components = parse_ocr_text(ocr_results)
        
        
        # If the list is empty, it means no valid airport components were found.
        if not structured_components:
            raise HTTPException(
                status_code=400, 
                detail="Invalid Image: No airport components (Gates, Desks, etc.) detected. Are you sure this is a valid airport layout?"
            )
        
        # 4. Generate Final JSON Response
        return JSONResponse(content={"components": structured_components})
        
    except HTTPException as http_exc:
        # We explicitly catch the HTTPException we just raised so it gets sent to the user as a 400 error
        raise http_exc
    except Exception as e:
        # Any other code failure (like a corrupt image file) gets sent as a 500 error
        return JSONResponse(content={"error": str(e)}, status_code=500)