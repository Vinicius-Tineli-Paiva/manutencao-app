Asset Maintenance Manager
A full-stack web application designed to help users manage their assets and track their maintenance schedules efficiently. This application provides a dashboard for an overview of upcoming and overdue maintenances, and detailed views for each asset and its associated maintenance history.

---

Features
User Authentication: Secure user registration and login.
Asset Management: Create, view, edit, and delete assets.
Maintenance Tracking: Log maintenance activities for each asset, including service descriptions, completion dates, and next due dates.
Maintenance Status: Mark maintenances as completed, with overdue and upcoming maintenance indicators.
Dashboard Overview: Quickly see all your assets and critical upcoming/overdue maintenances.
Detailed Asset View: Access a dedicated page for each asset to view its complete maintenance history.

---

Technologies Used

Backend
Node.js: JavaScript runtime environment.
Express.js: Web application framework for Node.js.
TypeScript: Typed superset of JavaScript.
PostgreSQL: Robust relational database.
pg: PostgreSQL client for Node.js.
bcrypt: For password hashing.
jsonwebtoken: For handling JWTs (JSON Web Tokens) for authentication.
dotenv: For managing environment variables.
cors: For enabling Cross-Origin Resource Sharing.

Frontend
React: JavaScript library for building user interfaces.
TypeScript: Typed superset of JavaScript.
Material-UI (MUI): React components for faster and easier web development.
Axios: Promise-based HTTP client for the browser and Node.js.
React Router DOM: For declarative routing in React applications.
Vite: Fast frontend build tool.

---

Getting Started
Follow these steps to set up and run the project locally.

Prerequisites
Before you begin, ensure you have the following installed on your system:

Git: For cloning the repository.
Node.js (LTS version recommended): Includes npm (Node Package Manager).
PostgreSQL: Database system.

1. Clone the Repository
   First, get the project files onto your local machine:

Bash
git clone <repository-url> # Replace with your actual repository URL
cd asset-maintenance-tracker # Navigate into the project's root directory

2. Database Setup

This project uses PostgreSQL. You'll need to create a database and a user for the application.

Install PostgreSQL: If you haven't already, install PostgreSQL.

Access PostgreSQL: You can use psql (command-line client) or a GUI tool like DBeaver, pgAdmin, or VS Code's PostgreSQL extension.
Using psql: Open your terminal and run psql -U postgres (or your PostgreSQL superuser).

3. Create Database and User:
   Execute the following SQL commands to create a dedicated user and database:

SQL
CREATE USER planofix_user WITH PASSWORD 'planofix_password';
CREATE DATABASE asset_maintenance_db OWNER planofix_user;
Important: If you choose different credentials, make sure to update your backend/.env file accordingly.

4. Install PostgreSQL Extensions (if not already installed):
   For UUID generation (used for IDs in the database), ensure the uuid-ossp and pgcrypto extensions are enabled in your asset_maintenance_db. Connect to your asset_maintenance_db and run:

SQL
-- Connect to your database first: \c asset_maintenance_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
gen_random_uuid() (used in init.sql) is part of pgcrypto and is generally preferred for UUIDs in newer PostgreSQL versions. uuid-ossp might also be needed for specific functions depending on your PostgreSQL version or if explicitly referenced.

5. Initialize Database Schema:
   The project schema is defined in backend/src/database/init.sql. This script creates all necessary tables (users, assets, maintenances) and triggers.

Caution: The init.sql script starts with DROP TABLE IF EXISTS .... If you have existing data you wish to preserve, DO NOT run these DROP TABLE commands. For initial setup, it's safe.
Execute the init.sql content in your asset_maintenance_db (via psql -d asset_maintenance_db -f backend/src/database/init.sql or through your GUI tool).

Backend Setup
Navigate to the backend directory in your terminal:

Bash
cd backend
Install Dependencies:

Bash
npm install

Create .env file:
Create a file named .env in the backend/ directory and add the following content:

PORT=3000
DATABASE_URL="postgresql://planofix_user:planofix_password@localhost:5432/asset_maintenance_db"
JWT_SECRET="your_super_secret_jwt_key_here"
PORT: The port where the backend server will run.
DATABASE_URL: Your PostgreSQL connection string. Ensure localhost matches your PostgreSQL host (e.g., 192.168.15.156 if running remotely, or localhost if running on the same machine).
JWT_SECRET: A strong, random string. Generate a long, complex string for production.

Build the Backend:

Bash
npm run build
This compiles the TypeScript code into JavaScript.

Start the Backend Server:

Bash
npm start

For development with live reloading, use:

Bash
npm run dev

The backend server should now be running, typically on http://localhost:3000 (or your specified PORT).

Frontend Setup
Open a new terminal and navigate to the frontend directory:

Bash
cd ../frontend # Go back to the root, then into frontend

Install Dependencies:

Bash
npm install

Start the Frontend:

Bash
npm start
The frontend application should now be running, typically on http://localhost:5173 (or another port Vite assigns).

---

Usage
Access the Application: Open your web browser and navigate to the frontend URL (e.g., http://localhost:5173).
Register/Login: Create a new account or log in with existing credentials.
Dashboard: After logging in, you'll be redirected to the dashboard, where you can see your assets and a summary of upcoming/overdue maintenances.
Manage Assets: Use the "Adicionar Ativo" (Add Asset) button to create new assets. Click on an asset's name to view its details.
Manage Maintenances: On the asset detail page, you can add new maintenances, edit existing ones, mark them as complete, and delete them.

---

Project Structure
.
├── backend/ # Node.js (Express) server
│ ├── src/
│ │ ├── controllers/ # Business logic for routes
│ │ ├── database/ # Database connection and schema (init.sql)
│ │ ├── middlewares/ # Authentication middleware
│ │ ├── models/ # Data models/interfaces
│ │ ├── routes/ # API endpoints (auth, assets, maintenances)
│ │ ├── services/ # Logic for interacting with the database/external APIs
│ │ └── server.ts # Main server file
│ ├── .env.example # Example environment variables
│ ├── package.json # Backend dependencies and scripts
│ ├── tsconfig.json # TypeScript configuration for backend
│ └── ...
└── frontend/ # React (Vite) client
├── public/
├── src/
│ ├── api/ # API service calls
│ ├── assets/
│ ├── components/ # Reusable UI components
│ │ ├── maintenances/ # Maintenance-specific components
│ ├── pages/ # Application pages (Dashboard, AssetDetail, Auth)
│ ├── types.ts # TypeScript type definitions
│ ├── App.tsx # Main React component
│ ├── main.tsx # React entry point
│ └── ...
├── index.html
├── package.json # Frontend dependencies and scripts
├── tsconfig.json # TypeScript configuration for frontend
└── vite.config.ts # Vite configuration

---

Contributing
If you wish to contribute to this project, please follow these steps:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature-name).
Make your changes.
Commit your changes (git commit -m 'feat: Add new feature').
Push to the branch (git push origin feature/your-feature-name).
Open a Pull Request.
