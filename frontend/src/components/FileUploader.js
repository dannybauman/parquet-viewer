import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';
import axios from 'axios';

function FileUploader({ setData, setError }) {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    setFileName(event.target.files[0]?.name || '');
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    let formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setData(response.data);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
      setData(null);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <Typography variant="h6">Upload Local Parquet File</Typography>
      <input
        accept=".parquet"
        style={{ display: 'none' }}
        id="upload-file"
        type="file"
        onChange={(e) => {
          handleFileChange(e);
          handleUpload(e);
        }}
        onClick={(e) => { e.target.value = null; }}
      />
      <label htmlFor="upload-file">
        <Button variant="contained" component="span" style={{ marginTop: '10px' }}>
          Choose File
        </Button>
      </label>
      {fileName && <Typography variant="body2">Selected File: {fileName}</Typography>}
    </div>
  );
}

export default FileUploader;
