# COMPSCI_4ZP6_CAPSTONE

## Running Website

1. Install Node.js and npm with `apt` or another package manager:

   ```sh
   sudo apt update
   sudo apt install -y nodejs npm
   ```

2. Move to `src` and update script permissions:
   ```sh
   cd ./src
   chmod +x run-website.sh
   ```
3. Run script:
   ```sh
   run-website.sh
   ```
4. Website is now accessible at `127.0.0.1:3000` and API is open at `127.0.0.1:8000`

## Accessing Database

The Python API stores created projects in `/src/react-ts-vite-app/backend/projects.db`.
