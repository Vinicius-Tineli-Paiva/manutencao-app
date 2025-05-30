# Asset Maintenance Manager

A full-stack web application designed to help users manage their assets and track their maintenance schedules efficiently. This application provides a dashboard for an overview of upcoming and overdue maintenances, and detailed views for each asset and its associated maintenance history.

---

## Features

- **User Authentication**: Secure user registration and login.
- **Asset Management**: Create, view, edit, and delete assets.
- **Maintenance Tracking**: Log maintenance activities for each asset, including service descriptions, completion dates, and next due dates.
- **Maintenance Status**: Mark maintenances as completed, with overdue and upcoming maintenance indicators.
- **Dashboard Overview**: Quickly see all your assets and critical upcoming/overdue maintenances.
- **Detailed Asset View**: Access a dedicated page for each asset to view its complete maintenance history.

---

## Technologies Used

### Backend

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework for Node.js.
- **TypeScript**: Typed superset of JavaScript.
- **PostgreSQL**: Robust relational database.
- **pg**: PostgreSQL client for Node.js.
- **bcrypt**: For password hashing.
- **jsonwebtoken**: For handling JWTs (JSON Web Tokens) for authentication.
- **dotenv**: For managing environment variables.
- **cors**: For enabling Cross-Origin Resource Sharing.

### Frontend

- **React**: JavaScript library for building user interfaces.
- **TypeScript**: Typed superset of JavaScript.
- **Material-UI (MUI)**: React components for faster and easier web development.
- **Axios**: Promise-based HTTP client for the browser and Node.js.
- **React Router DOM**: For declarative routing in React applications.
- **Vite**: Fast frontend build tool.

---

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Git**: For cloning the repository.
- **Node.js** (LTS version recommended): Includes npm (Node Package Manager).
- **PostgreSQL**: Database system.

### 1. Clone the Repository

```bash
git clone <repository-url> # Replace with your actual repository URL
cd manutencao-app # Navigate into the project's root directory

2. Database Setup
This project uses PostgreSQL. You'll need to create a database and a user for the application.

Install PostgreSQL
If you haven't already, install PostgreSQL.

Access PostgreSQL
You can use psql (command-line client) or a GUI tool like DBeaver, pgAdmin, or the PostgreSQL extension in VS Code.

Using psql:
psql -U postgres

3. Create Database and User
Execute the following SQL commands:
CREATE USER planofix_user WITH PASSWORD 'planofix_password';
CREATE DATABASE asset_maintenance_db OWNER planofix_user;
⚠️ If you choose different credentials, make sure to update your backend/.env file accordingly.

4. Install PostgreSQL Extensions
For UUID generation, ensure the uuid-ossp and pgcrypto extensions are enabled in your asset_maintenance_db:
-- Connect to your database:
\c asset_maintenance_db

-- Create extensions:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
gen_random_uuid() (used in init.sql) is part of pgcrypto and generally preferred in newer PostgreSQL versions. uuid-ossp might be needed for specific functions.

5. Initialize Database Schema
The schema is defined in backend/src/database/init.sql. It creates tables (users, assets, maintenances) and triggers.
⚠️ The script starts with DROP TABLE IF EXISTS .... Do not run it if you want to preserve existing data.

To execute:
psql -d asset_maintenance_db -f backend/src/database/init.sql
Or use your GUI tool to run the contents of init.sql.

Backend Setup
Navigate to the backend directory:
cd backend

Install Dependencies
npm install

Create .env File
Create a .env file inside backend/ with the following content:
PORT=3000
DATABASE_URL="postgresql://planofix_user:planofix_password@localhost:5432/asset_maintenance_db"
JWT_SECRET="your_super_secret_jwt_key_here"

PORT: Port where the backend server will run.
DATABASE_URL: Your PostgreSQL connection string.
JWT_SECRET: A strong, random string for JWT signing.

Build the Backend
npm run build

Start the Backend Server
npm start

For development (with hot reload):
npm run dev

By default, the backend runs at: http://localhost:3000

Frontend Setup
Open a new terminal and navigate to the frontend directory:
cd ../frontend

Install Dependencies
npm install

Start the Frontend
npm start

By default, the frontend runs at: http://localhost:5173

Usage
Access the Application: Open http://localhost:5173.
Register/Login: Create an account or login with existing credentials.
Dashboard: View all assets and a summary of upcoming/overdue maintenances.
Manage Assets: Click "Adicionar Ativo" to add a new asset. Click an asset name to view details.
Manage Maintenances: On the asset detail page, add/edit/delete maintenances and mark them as complete.

Project Structure
.
├── backend/                     # Node.js (Express) server
│   ├── src/
│   │   ├── controllers/         # Business logic for routes
│   │   ├── database/            # DB connection and schema (init.sql)
│   │   ├── middlewares/         # Auth middleware
│   │   ├── models/              # Data models/interfaces
│   │   ├── routes/              # API routes (auth, assets, maintenances)
│   │   ├── services/            # DB interaction logic
│   │   └── server.ts            # Main server entry point
│   ├── .env.example             # Sample environment config
│   ├── package.json             # Backend scripts/deps
│   ├── tsconfig.json            # TypeScript config
│   └── ...
└── frontend/                    # React (Vite) client
    ├── public/
    ├── src/
    │   ├── api/                 # API service functions
    │   ├── assets/
    │   ├── components/          # Reusable UI components
    │   │   └── maintenances/    # Maintenance-specific components
    │   ├── pages/               # Pages (Dashboard, AssetDetail, Auth)
    │   ├── types.ts             # TS types
    │   ├── App.tsx              # Root component
    │   ├── main.tsx             # App entry point
    │   └── ...
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts


    Contributing
If you wish to contribute to this project, please follow these steps:

Fork the repository.

Create a new branch:
git checkout -b feature/your-feature-name

Make your changes.

Commit your changes:
git commit -m 'feat: Add new feature'

Push to your branch:
git push origin feature/your-feature-name
Open a Pull Request.

Repository: https://github.com/Vinicius-Tineli-Paiva/manutencao-app
```
