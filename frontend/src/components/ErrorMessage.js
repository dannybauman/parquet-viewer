import React from 'react';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';

function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <Box mt={2}>
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
          {message}
        </Typography>
      </Alert>
    </Box>
  );
}

export default ErrorMessage;
