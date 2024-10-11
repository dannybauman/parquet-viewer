import React, { useState } from "react";
import { Container, Typography } from "@mui/material";
import FileUploader from "./components/FileUploader";
import URLFetcher from "./components/URLFetcher";
import DataDisplay from "./components/DataDisplay";
import ErrorMessage from "./components/ErrorMessage";
import "./styles/App.css";

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleSetData = (newData) => {
    console.log("Setting new data:", newData);
    setData(newData);
    setError(null);
  };

  const handleSetError = (newError) => {
    console.error("Setting new error:", newError);
    setError(newError);
    setData(null);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Parquet File Overview
      </Typography>
      <FileUploader setData={handleSetData} setError={handleSetError} />
      <URLFetcher setData={handleSetData} setError={handleSetError} />
      {error && <ErrorMessage message={error} />}
      {data && <DataDisplay data={data} />}
    </Container>
  );
}

export default App;
