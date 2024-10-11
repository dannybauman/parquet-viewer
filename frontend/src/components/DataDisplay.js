import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Box,
  TableHead,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { JSONTree } from "react-json-tree";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
  padding: "8px",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  fontWeight: "bold",
  color: theme.palette.primary.main,
}));

const jsonTreeTheme = {
  scheme: "monokai",
  author: "wimer hazenberg (http://www.monokai.nl)",
  base00: "#272822",
  base01: "#383830",
  base02: "#49483e",
  base03: "#75715e",
  base04: "#a59f85",
  base05: "#f8f8f2",
  base06: "#f5f4f1",
  base07: "#f9f8f5",
  base08: "#f92672",
  base09: "#fd971f",
  base0A: "#f4bf75",
  base0B: "#a6e22e",
  base0C: "#a1efe4",
  base0D: "#66d9ef",
  base0E: "#ae81ff",
  base0F: "#cc6633",
};

// Helper function to parse stringified JSON with single quotes and 'None'
const parseJSON = (input) => {
  if (typeof input === "string") {
    try {
      // Replace single quotes with double quotes and 'None' with 'null'
      let sanitized = input.replace(/'/g, '"').replace(/\bNone\b/g, "null");
      // Replace array([...], dtype=object) with [...]
      sanitized = sanitized.replace(/array\((.*?)\)/g, "[$1]");
      return JSON.parse(sanitized);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return null;
    }
  }
  return input;
};

// Define columns that contain complex data structures
const complexColumns = [
  "assets",
  "links",
  "cube:dimensions",
  "cube:variables",
  "properties",
  "geometry",
];

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "Not available";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper function to format cell values based on column type
const formatCellValue = (colName, value) => {
  if (complexColumns.includes(colName)) {
    // Handle complex columns
    const parsed = parseJSON(value);
    if (parsed) {
      if (Array.isArray(parsed)) {
        return (
          <Tooltip
            title={
              <JSONTree
                data={parsed}
                theme={jsonTreeTheme}
                invertTheme={false}
              />
            }
            arrow>
            <Typography variant="body2">{`${parsed.length} items`}</Typography>
          </Tooltip>
        );
      } else if (typeof parsed === "object") {
        return (
          <Tooltip
            title={
              <JSONTree
                data={parsed}
                theme={jsonTreeTheme}
                invertTheme={false}
              />
            }
            arrow>
            <Typography variant="body2">{`${
              Object.keys(parsed).length
            } keys`}</Typography>
          </Tooltip>
        );
      }
    }
    return "Complex Data";
  }

  // For simple columns
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return value !== null && value !== undefined ? value.toString() : "";
};

function DataDisplay({ data }) {
  const { columns, data: rows } = data;

  if (!rows || rows.length === 0) {
    return <Typography>No data available.</Typography>;
  }

  const firstRow = rows[0];

  // Extract and format geospatial information
  let bbox = parseJSON(firstRow["bbox"]);
  let formattedBBox = "Not available";
  if (bbox && typeof bbox === "object") {
    const { xmin, ymin, xmax, ymax } = bbox;
    if (
      xmin !== undefined &&
      ymin !== undefined &&
      xmax !== undefined &&
      ymax !== undefined
    ) {
      formattedBBox = `[${xmin}, ${ymin}, ${xmax}, ${ymax}]`;
    }
  }

  // Check for coordinate reference system under different keys
  const crs =
    firstRow["crs"] ||
    firstRow["coordinate_system"] ||
    firstRow["coordinateReferenceSystem"] ||
    "Not available";

  const geospatialInfo = {
    "Bounding Box": formattedBBox,
    "Start Date": formatDate(firstRow["start_datetime"]),
    "End Date": formatDate(firstRow["end_datetime"]),
    "Coordinate Reference System": crs,
  };

  // Extract metadata
  const metadata = {
    ID: firstRow["id"] || "Not available",
    Type: firstRow["type"] || "Not available",
    Collection: firstRow["collection"] || "Not available",
    "STAC Version": firstRow["stac_version"] || "Not available",
    "STAC Extensions": Array.isArray(firstRow["stac_extensions"])
      ? firstRow["stac_extensions"].join(", ")
      : firstRow["stac_extensions"] || "Not available",
  };

  // Extract and parse assets
  let assets = parseJSON(firstRow["assets"]) || {};
  const assetEntries = Object.entries(assets).filter(
    ([key, value]) => value !== null
  );

  // Extract cube:variables if available
  const cubeVariables = parseJSON(firstRow["cube:variables"]) || {};
  const variableEntries =
    Object.keys(cubeVariables).length > 0
      ? Object.entries(cubeVariables).map(([varName, varInfo]) => ({
          name: varName,
          description: varInfo.description || varInfo.attrs?.long_name || "",
          units: varInfo.unit || varInfo.attrs?.units || "",
          dimensions: (varInfo.dimensions || []).join(", "),
          type: varInfo.type || "",
        }))
      : // Fallback to assets
        assetEntries.map(([key, value]) => ({
          name: value["cmip6:variable"] || key,
          description: value.description || value.attrs?.long_name || "",
          units: value.unit || value.attrs?.units || "",
          dimensions: "time, lat, lon", // Assuming common dimensions; adjust if necessary
          type: value.type || "",
        }));

  // Extract cube:dimensions if available
  const cubeDimensions = parseJSON(firstRow["cube:dimensions"]) || {};
  const dimensionEntries = Object.entries(cubeDimensions).map(
    ([dimName, dimInfo]) => ({
      name: dimName,
      description: dimInfo.description || "",
      type: dimInfo.type || "",
      extent: Array.isArray(dimInfo.extent) ? dimInfo.extent.join(" - ") : "",
      step: dimInfo.step || "",
    })
  );

  // Prepare sample data rows
  const sampleRows = rows.slice(0, 10); // Get the first 10 rows
  const dataColumns = columns.map((col) => col.name);

  return (
    <Box sx={{ marginTop: "30px" }}>
      {/* Metadata Section */}
      <SectionTitle variant="h5">Metadata</SectionTitle>
      <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
        <Table size="small">
          <TableBody>
            {Object.entries(metadata).map(([key, value]) => (
              <TableRow key={key}>
                <StyledTableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: "bold", width: "30%" }}>
                  {key}
                </StyledTableCell>
                <StyledTableCell>{value}</StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Geospatial Information Section */}
      <SectionTitle variant="h5">Geospatial Information</SectionTitle>
      <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
        <Table size="small">
          <TableBody>
            {Object.entries(geospatialInfo).map(([key, value]) => (
              <TableRow key={key}>
                <StyledTableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: "bold", width: "30%" }}>
                  {key}
                </StyledTableCell>
                <StyledTableCell>{value}</StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Assets Section */}
      {assetEntries.length > 0 && (
        <>
          <SectionTitle variant="h5">Assets</SectionTitle>
          <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Variable</StyledTableCell>
                  <StyledTableCell>HREF</StyledTableCell>
                  <StyledTableCell>Type</StyledTableCell>
                  <StyledTableCell>Roles</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetEntries.map(([key, value]) => {
                  const href = value.href || "Not available";
                  const type = value.type || "Not available";
                  const roles = Array.isArray(value.roles)
                    ? value.roles.join(", ")
                    : value.roles || "Not available";
                  return (
                    <TableRow key={key}>
                      <StyledTableCell>{key}</StyledTableCell>
                      <StyledTableCell
                        sx={{ wordBreak: "break-all", maxWidth: "200px" }}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer">
                          {href.length > 60
                            ? `${href.substring(0, 60)}...`
                            : href}
                        </a>
                      </StyledTableCell>
                      <StyledTableCell>{type}</StyledTableCell>
                      <StyledTableCell>{roles}</StyledTableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Variables Section */}
      {variableEntries.length > 0 && (
        <>
          <SectionTitle variant="h5">Variables</SectionTitle>
          <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Variable Name</StyledTableCell>
                  <StyledTableCell>Description</StyledTableCell>
                  <StyledTableCell>Units</StyledTableCell>
                  <StyledTableCell>Dimensions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variableEntries.map((variable) => (
                  <TableRow key={variable.name}>
                    <StyledTableCell>{variable.name}</StyledTableCell>
                    <StyledTableCell>{variable.description}</StyledTableCell>
                    <StyledTableCell>{variable.units}</StyledTableCell>
                    <StyledTableCell>{variable.dimensions}</StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Dimensions Section */}
      {dimensionEntries.length > 0 && (
        <>
          <SectionTitle variant="h5">Dimensions</SectionTitle>
          <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Dimension Name</StyledTableCell>
                  <StyledTableCell>Description</StyledTableCell>
                  <StyledTableCell>Type</StyledTableCell>
                  <StyledTableCell>Extent</StyledTableCell>
                  <StyledTableCell>Step</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dimensionEntries.map((dimension) => (
                  <TableRow key={dimension.name}>
                    <StyledTableCell>{dimension.name}</StyledTableCell>
                    <StyledTableCell>{dimension.description}</StyledTableCell>
                    <StyledTableCell>{dimension.type}</StyledTableCell>
                    <StyledTableCell>{dimension.extent}</StyledTableCell>
                    <StyledTableCell>{dimension.step}</StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Sample Data Rows Section */}
      <SectionTitle variant="h5">Sample Data Rows</SectionTitle>
      <TableContainer
        component={Paper}
        sx={{ marginBottom: "20px", maxHeight: 400, overflow: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {dataColumns.map((colName) => (
                <StyledTableCell key={colName}>{colName}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {dataColumns.map((colName) => (
                  <StyledTableCell key={colName}>
                    {formatCellValue(colName, row[colName])}
                  </StyledTableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Properties Section */}
      {firstRow["properties"] &&
        Object.keys(firstRow["properties"]).length > 0 && (
          <>
            <SectionTitle variant="h5">Properties</SectionTitle>
            <Paper sx={{ padding: 2 }}>
              <JSONTree
                data={firstRow["properties"]}
                theme={jsonTreeTheme}
                invertTheme={false}
              />
            </Paper>
          </>
        )}
    </Box>
  );
}

export default DataDisplay;
