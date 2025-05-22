#!/bin/sh

# Initialize the database
cd /app/backend
python init_db.py

# Start the backend server
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Start the frontend server
cd /app
npm start
