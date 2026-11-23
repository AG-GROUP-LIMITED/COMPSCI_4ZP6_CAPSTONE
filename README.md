# COMPSCI_4ZP6_CAPSTONE

## Running Website

1. Install Node.js and npm with `apt` or another package manager:

   ```sh
   sudo apt update
   sudo apt install -y nodejs npm
   ```

2. Navigate to react source folder and build:
   ```sh
   cd /src
   npm install
   npm run build
   ```
3. Give permission to script:
   ```sh
   chmod +x run-website.sh
   ```
4. Run script:
   ```sh
   run-website.sh
   ```
5. Website is now accessible at `127.0.0.1:8000` and API is open at `127.0.0.1:3000`

## Accessing Database

The Python API stores created projects in `/src/react-ts-vite-app/backend/projects.db`.

## Data Design

The data entities are modelled [here](https://dbdiagram.io/d/6af3cfc1063ad9ee168ab20c)

<img width="812" height="652" alt="Screenshot 2026-11-22 at 12 35 39 PM" src="https://github.com/user-attachments/assets/b6ceb87c-9d3a-4ec9-b27d-07072d627526" />

