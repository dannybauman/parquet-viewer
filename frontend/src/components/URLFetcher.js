import React, { useState } from 'react';
import { Button, TextField, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

function URLFetcher({ setData, setError }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/fetch', { url });
      console.log('Fetch response:', response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.response?.data?.detail || error.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <Typography variant="h6">Fetch Parquet File from URL</Typography>
      <TextField
        label="URL"
        variant="outlined"
        fullWidth
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ marginTop: '10px' }}
      />
      <Button
        variant="contained"
        onClick={handleFetch}
        style={{ marginTop: '10px' }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Fetch File'}
      </Button>
    </div>
  );
}

export default URLFetcher;
