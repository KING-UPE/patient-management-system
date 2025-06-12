# Patient Record Management System

A web-based system for managing patient records in a teaching hospital.

## Features

- Add new patients
- View and search existing patients
- Update patient information
- Delete patient records
- Filter patients by various criteria
- Dashboard with statistics

## Technologies Used

- Frontend: HTML5, Bootstrap 5, jQuery, AJAX
- Backend: Node.js, Express.js
- Database: MongoDB
- RESTful API architecture

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the server: `npm start`
5. Access the application at `http://localhost:3000`

## API Endpoints

- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create a new patient
- `GET /api/patients/:pid` - Get a specific patient
- `PUT /api/patients/:pid` - Update a patient
- `DELETE /api/patients/:pid` - Delete a patient
- `GET /api/patients/stats` - Get patient statistics