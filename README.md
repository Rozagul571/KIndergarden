# KinderChef - Kindergarten Meal Tracking & Inventory Management System

A comprehensive system for tracking meals, inventory, and staff activities in kindergarten settings.

## Features

- User authentication with role-based access control
- Real-time notifications via WebSockets
- Inventory management
- Meal planning and serving
- Order management
- Staff activity tracking
- Reporting and analytics

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, SQLAlchemy, SQLite
- **Real-time**: WebSockets
- **Authentication**: JWT

## Local Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Git

### Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/kindergarten-meal-system.git
cd kindergarten-meal-system
\`\`\`

### Frontend Setup

1. Install dependencies:

\`\`\`bash
npm install
\`\`\`

2. Start the development server:

\`\`\`bash
npm run dev
\`\`\`

The frontend will be available at http://localhost:3000

### Backend Setup

1. Create a virtual environment:

\`\`\`bash
python -m venv venv
\`\`\`

2. Activate the virtual environment:

- On Windows:
\`\`\`bash
venv\Scripts\activate
\`\`\`

- On macOS/Linux:
\`\`\`bash
source venv/bin/activate
\`\`\`

3. Install dependencies:

\`\`\`bash
cd backend
pip install -r requirements.txt
\`\`\`

4. Initialize the database with sample users:

\`\`\`bash
python init_db.py
\`\`\`

5. Start the backend server:

\`\`\`bash
uvicorn main:app --reload
\`\`\`

The backend API will be available at http://localhost:8000

## Docker Setup

If you prefer to use Docker, you can use the provided Docker Compose file:

1. Make sure Docker and Docker Compose are installed on your system.

2. Build and start the containers:

\`\`\`bash
docker-compose up -d
\`\`\`

3. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

4. To stop the containers:

\`\`\`bash
docker-compose down
\`\`\`

## Database

The system uses SQLite for simplicity in development. The database file is located at `backend/kindergarten_meals.db`.

To backup the database:

\`\`\`bash
cp backend/kindergarten_meals.db backend/kindergarten_meals.db.backup
\`\`\`

To restore from a backup:

\`\`\`bash
cp backend/kindergarten_meals.db.backup backend/kindergarten_meals.db
\`\`\`

## User Credentials

### Admin
- **Username**: admin@example.com or Surayyo Karimova
- **Password**: Surayyo123

### Cooks
- **Og'iloy Tursunova**: cook1@example.com / Ogiloy123
- **Muxtasar Azizova**: cook2@example.com / Muxtasar123
- **Aziza Rahimova**: cook3@example.com / Aziza123
- **Odina Rustamova**: cook4@example.com / Odina123
- **Tanzila Nodirbekova**: cook5@example.com / Tanzila123

### Managers
- **Kamola Umarova**: manager1@example.com / Kamola123
- **Shakhzoda Kamalova**: manager2@example.com / Shakhzoda123

## Project Structure

- `/app`: Next.js pages and layouts
- `/components`: Reusable React components
- `/contexts`: React context providers
- `/hooks`: Custom React hooks
- `/types`: TypeScript type definitions
- `/backend`: FastAPI backend code
  - `/models`: Database models
  - `/routers`: API routes
  - `/schemas`: Pydantic schemas
  - `/utils`: Utility functions

## WebSocket Integration

The system uses WebSockets for real-time notifications. When a user performs an action (like serving a meal or updating inventory), a notification is sent to relevant users based on their roles.

- **Admin**: Receives all notifications
- **Cook**: Receives notifications related to meals and inventory
- **Manager**: Receives notifications related to inventory and orders

## Pushing to GitHub

To push the project to GitHub with the database:

1. Create a new repository on GitHub.

2. Initialize Git in your local project (if not already done):

\`\`\`bash
git init
\`\`\`

3. Add all files to Git:

\`\`\`bash
git add .
\`\`\`

4. Commit the changes:

\`\`\`bash
git commit -m "Initial commit"
\`\`\`

5. Add your GitHub repository as a remote:

\`\`\`bash
git remote add origin https://github.com/your-username/your-repo-name.git
\`\`\`

6. Push to GitHub:

\`\`\`bash
git push -u origin main
\`\`\`

Note: Make sure to include the database file in your .gitignore if you don't want to push it to GitHub.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
