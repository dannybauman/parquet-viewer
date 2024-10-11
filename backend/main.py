from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
import pyarrow.parquet as pq
import aiohttp
import tempfile
import os
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from datetime import datetime, date
import dateutil.parser
import json
import traceback
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow CORS for local development (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

@app.post("/api/upload")
async def upload_parquet(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        result = process_parquet_file(tmp_file_path)
        os.unlink(tmp_file_path)  # Clean up temporary file
        return result
    except Exception as e:
        error_message = f"Error uploading file: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_message)

@app.post("/api/fetch")
async def fetch_parquet(url_request: URLRequest):
    try:
        logger.info(f"Fetching Parquet file from URL: {url_request.url}")
        tmp_file_path = await download_file(url_request.url)
        logger.info(f"File downloaded successfully to: {tmp_file_path}")

        result = process_parquet_file(tmp_file_path)
        logger.info(f"Parquet file processed successfully. Columns: {len(result['columns'])}, Rows: {len(result['data'])}")

        os.unlink(tmp_file_path)  # Clean up temporary file
        logger.info("Temporary file cleaned up")

        return result
    except HTTPException as he:
        logger.error(f"HTTP Exception: {str(he)}")
        raise he
    except Exception as e:
        error_message = f"Error fetching file: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_message)
        raise HTTPException(status_code=500, detail=error_message)

async def download_file(url):
    # Validate URL
    if not url.lower().startswith(('http://', 'https://')):
        raise HTTPException(status_code=400, detail="Invalid URL")

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=400, detail=f"Failed to fetch remote file. Status code: {resp.status}")
                with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                    size = 0
                    while True:
                        chunk = await resp.content.read(8192)
                        if not chunk:
                            break
                        size += len(chunk)
                        tmp_file.write(chunk)
                    logger.info(f"Downloaded file size: {size} bytes")
                    return tmp_file.name
        except aiohttp.ClientError as e:
            raise HTTPException(status_code=400, detail=f"Error downloading file: {str(e)}")

def process_parquet_file(file_path, num_rows=100):
    try:
        # Read the Parquet file
        parquet_file = pq.ParquetFile(file_path)

        # Extract schema
        schema = parquet_file.schema_arrow
        columns = [{'name': field.name, 'type': str(field.type)} for field in schema]

        # Read sample data
        df = parquet_file.read_row_groups([0]).to_pandas().head(num_rows)

        # Convert data to JSON-serializable format
        def json_serializable(val):
          if isinstance(val, (np.ndarray, list, tuple)):
              # For arrays or lists or tuples, recursively apply json_serializable
              return [json_serializable(v) for v in val]
          elif pd.isna(val):
              return None
          elif isinstance(val, (np.integer, np.floating)):
              return float(val)
          elif isinstance(val, (np.bool_, bool)):
              return bool(val)
          elif isinstance(val, (datetime, date)):
              return val.isoformat()
          elif isinstance(val, (bytes, np.bytes_)):
              return val.decode('utf-8', errors='ignore')
          elif isinstance(val, pd.Series):
              return val.apply(json_serializable).tolist()
          else:
              return str(val)


        # Apply json_serializable to each element in the DataFrame
        data = df.map(json_serializable).to_dict(orient='records')

        # Ensure the entire structure is JSON serializable
        json_data = json.loads(json.dumps({'columns': columns, 'data': data}))

        return json_data
    except Exception as e:
        error_message = f"Error processing Parquet file: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_message)
        raise HTTPException(status_code=500, detail=error_message)
