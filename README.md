# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## MongoDB database setup (BloodConnect)

This version stores users, blood requests, donor responses, and activity logs in MongoDB instead of browser localStorage.

### 1. Create MongoDB Atlas database
Create a free MongoDB Atlas cluster and copy its connection string.

### 2. Configure the server
Inside `server/`, copy `.env.example` to `.env` and set `MONGODB_URI` to your Atlas connection string.

### 3. Install and run the backend
```bash
cd server
npm install
npm start
```

The API runs on `http://localhost:4000` and creates the default admin automatically:
- Login ID: `admin`
- Password: `admin123`

### 4. Run the React frontend
Open another terminal at the project root:
```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

### Important
Do not commit `server/.env` to GitHub. It contains your database credentials.
