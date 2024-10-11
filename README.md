# Parquet File Processor

This web application allows users to upload local Parquet files or fetch remote Parquet files, and displays the columns and sample data from these files.

## Features

- Upload local Parquet files
- Fetch remote Parquet files via URL
- Display Parquet file schema (columns and their types)
- Show sample data from the Parquet file
- Responsive web interface

## Tech Stack

### Backend
- FastAPI
- Python 3.12
- pyarrow
- pandas

### Frontend
- React
- Material-UI
- Axios

## Setup and Installation

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```
   uvicorn main:app --reload
   ```

   The backend will be available at `http://localhost:8000`.

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

   The frontend will be available at `http://localhost:3000`.

## Usage

1. Open your web browser and go to `http://localhost:3000`.
2. To upload a local Parquet file, click on "Choose File" under "Upload Local Parquet File".
3. To fetch a remote Parquet file, enter the URL in the input field under "Fetch Parquet File from URL" and click "Fetch File".
4. The application will display the file's schema and a sample of the data.

## API Endpoints

- `POST /api/upload`: Upload a local Parquet file
- `POST /api/fetch`: Fetch a remote Parquet file

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
