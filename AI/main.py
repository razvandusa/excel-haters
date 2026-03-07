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
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image.")
    
    # Just convert to grayscale to remove color noise, but keep all the detail!
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    return gray

def parse_ocr_text(raw_text_list: list):
    components = []
    
    # Pattern: Looks for D, SC, G, or S followed immediately by numbers or letters (eg. D1, SC2 etc.)
    # We use ^ and $ to ensure we match the whole string without random trailing garbage
    pattern = re.compile(r"^(D|SC|G|S)([A-Z0-9]+)$")   
    
    for text in raw_text_list:
        # Clean common OCR mistakes before regex matching 
        # (e.g., removing spaces, fixing 'l' or 'I' read as '1')
        clean_text = text.replace(" ", "").upper()

        # Split into prefix and number parts so we only fix mistakes in the right place.
        # We try to extract a known prefix first, then apply corrections only to that part.
        # This prevents replacing '6' with 'G' inside a valid number like D6 or S16.
        raw_prefix = clean_text[:2] if len(clean_text) >= 2 else clean_text

        # Prefix-only fixes: characters that look like valid prefix letters when misread
        # Applied ONLY to the first 1-2 characters, never to the numeric suffix
        PREFIX_FIXES = {
            "0": "D",  # 0 looks like D
            "6": "G",  # 6 looks like G
            "5": "S",  # 5 looks like S
        }

        # Fix the prefix region (first 1-2 chars) and leave the rest untouched
        if len(clean_text) >= 2 and clean_text[:2] in PREFIX_FIXES:
            clean_text = PREFIX_FIXES[clean_text[:2]] + clean_text[2:]
        elif len(clean_text) >= 1 and clean_text[0] in PREFIX_FIXES:
            clean_text = PREFIX_FIXES[clean_text[0]] + clean_text[1:]

        # Number-only fixes: characters that look like digits when misread
        # Safe to apply globally after the prefix is already validated
        clean_text = clean_text[:1] + clean_text[1:].replace("L", "1").replace("I", "1")
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