import easyocr
import cv2
import numpy as np
import re
import json

# 1. Initialize the reader (English only for now)
# Set gpu=True if you have an NVIDIA GPU installed
reader = easyocr.Reader(['en'], gpu=True)

def preprocess_image(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image.")
    
    # Just convert to grayscale to remove color noise, but keep all the detail!
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    return gray

def test_on_real_image(image_path):
    print(f"--- Processing: {image_path} ---")

    img = cv2.imread(image_path)
    if img is None:
        print("Error: Could not find or open the image file.")
        return

    processed = img.copy()

    # detail=0 returns just the text strings
    results = reader.readtext(processed, detail=0)
    print(f"Raw OCR Output: {results}")

    pattern = re.compile(r"^(D|SC|G|S)([A-Z0-9]+)$")
    structured_components = []

    for text in results:
        clean_text = text.replace(" ", "").upper()

        # Prefix-only fixes: applied ONLY to the first 1-2 characters
        # Prevents replacing '6' with 'G' inside a valid number like D6 or S16
        PREFIX_FIXES = {"0": "D", "6": "G", "5": "S"}
        if len(clean_text) >= 2 and clean_text[:2] in PREFIX_FIXES:
            clean_text = PREFIX_FIXES[clean_text[:2]] + clean_text[2:]
        elif len(clean_text) >= 1 and clean_text[0] in PREFIX_FIXES:
            clean_text = PREFIX_FIXES[clean_text[0]] + clean_text[1:]

        # Number-only fixes: I and L look like 1, applied after the first character
        clean_text = clean_text[:1] + clean_text[1:].replace("L", "1").replace("I", "1")

        match = pattern.match(clean_text)
        if match:
            prefix = match.group(1)
            name = match.group(2)

            mapping = {"D": "DESK", "SC": "SECURITY CHECK", "G": "GATE", "S": "STAND"}
            structured_components.append({
                "type": mapping[prefix],
                "name": name
            })

    print("\n--- Final JSON for Backend ---")
    print(json.dumps({"components": structured_components}, indent=2))

test_on_real_image(r"D:\HackTech\excel-haters\AI\files\pre_3_clahe_otsu.png")