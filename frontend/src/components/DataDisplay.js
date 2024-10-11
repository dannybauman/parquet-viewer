import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  fontWeight: "bold",
  color: theme.palette.primary.main,
}));

function DataDisplay({ data }) {
  const { columns, data: rows } = data;

  if (!rows || rows.length === 0) {
    return <Typography>No data available.</Typography>;
  }

  const firstRow = rows[0];

  // Extract and format geospatial information
  const bbox = firstRow["bbox"];
  const formattedBBox = bbox
    ? `West: ${bbox.xmin}, South: ${bbox.ymin}, East: ${bbox.xmax}, North: ${bbox.ymax}`
    : "Not available";

  const geospatialInfo = {
    "Bounding Box": formattedBBox,
    "Start Date": formatDate(firstRow["start_datetime"]),
    "End Date": formatDate(firstRow["end_datetime"]),
  };

  // Extract additional information
  const additionalInfo = {
    ID: firstRow["id"] || "Not available",
    Type: firstRow["type"] || "Not available",
    Collection: firstRow["collection"] || "Not available",
    "STAC Version": firstRow["stac_version"] || "Not available",
    "STAC Extensions": Array.isArray(firstRow["stac_extensions"])
      ? firstRow["stac_extensions"].join(", ")
      : firstRow["stac_extensions"] || "Not available",
  };

  // Helper function to format dates
  function formatDate(dateString) {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  return (
    <Box sx={{ marginTop: "30px" }}>
      <SectionTitle variant="h5">Geospatial Information</SectionTitle>
      <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
        <Table size="small">
          <TableBody>
            {Object.entries(geospatialInfo).map(([key, value]) => (
              <TableRow key={key}>
                <StyledTableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: "bold" }}>
                  {key}
                </StyledTableCell>
                <StyledTableCell>{value}</StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      <SectionTitle variant="h5">Additional Information</SectionTitle>
      <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
        <Table size="small">
          <TableBody>
            {Object.entries(additionalInfo).map(([key, value]) => (
              <TableRow key={key}>
                <StyledTableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: "bold" }}>
                  {key}
                </StyledTableCell>
                <StyledTableCell>{value}</StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default DataDisplay;
