# Running Website

1. Install Node.js and npm with `apt` or another package manager:

   ```sh
   sudo apt update
   sudo apt install -y nodejs npm
   ```

2. Navigate to react source folder and build:
   ```sh
   cd /src/react-ts-vite-app
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

# Accessing Database

The Python API stores created projects in `/src/backend/projects.db`.
