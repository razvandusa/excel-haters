import requests
import json

# The URL where your FastAPI server is running
API_URL = "http://127.0.0.1:8002/flights/import"

# The file we want to send to the AI
FILE_PATH = "D:\\HackTech\\excel-haters\\AI\\files\\sample_flights.txt" 

def test_api():
    print(f"Sending '{FILE_PATH}' to the AI Server...")
    
    try:
        # Open the file in binary read mode ('rb')
        with open(FILE_PATH, "rb") as file_to_upload:
            # We package the file in a dictionary under the key "file" 
            # because your FastAPI endpoint expects a parameter named 'file'
            files = {"file": (FILE_PATH, file_to_upload, "text/plain")}
            
            # Send the POST request to the server
            response = requests.post(API_URL, files=files)
            
        # Check if the server returned a successful status code (200 OK)
        if response.status_code == 200:
            print("Success! Here is the JSON the AI generated:\n")
            
            # Parse and print the JSON beautifully
            result_json = response.json()
            print(json.dumps(result_json, indent=2))
        else:
            print(f"Server returned an error: {response.status_code}")
            print(response.text)
            print(response.json()) # ← add this
            
    except FileNotFoundError:
        print(f"Error: Could not find the file '{FILE_PATH}'. Make sure it exists!")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Is FastAPI running on port 8000?")

if __name__ == "__main__":
    test_api()