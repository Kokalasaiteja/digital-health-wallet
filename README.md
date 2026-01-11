# Digital Health Wallet

A comprehensive health management application that allows users to store, manage, and share their medical reports and vital signs securely.

## 🛠️ Technology Stack

- **Frontend:** ReactJS with React Router for navigation
- **Backend:** Node.js with Express.js framework
- **Database:** SQLite for data persistence
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer for handling file uploads
- **Charts:** Chart.js for visualizing vital trends

## 📋 Features

### User Management
- User registration and login
- JWT-based authentication
- Role-based access control (Owner, Viewer)

### Health Reports
- Upload medical reports (PDF/Image)
- Store metadata (report type, date, associated vitals)
- View and download uploaded reports
- Filter reports by date, type, and vital type

### Vitals Tracking
- Store vital signs data over time
- Visualize vitals trends using interactive charts
- Filter vitals by date range and type

### Access Control
- Share specific reports with doctors, family members, or friends
- Define read-only access for shared users
- Revoke access to shared reports

## 🏗️ System Architecture

### Frontend (ReactJS)
- **Components:** Login, Register, Dashboard, UploadReport, ViewReports, Vitals, ShareReport
- **State Management:** React hooks for local state management
- **API Integration:** Axios for HTTP requests to backend APIs
- **Routing:** React Router for client-side navigation

### Backend (Node.js)
- **Server:** Express.js server running on port 5000
- **Routes:** Modular route handlers for auth, reports, vitals, and sharing
- **Authentication:** JWT middleware for protecting routes
- **File Handling:** Multer for multipart form data processing

### Database (SQLite)
- **Tables:**
  - `users`: User accounts with authentication details
  - `reports`: Medical reports with metadata and file references
  - `vitals`: Vital signs data over time
  - `shared_access`: Access control for shared reports

### File Storage
- Local file system storage in `backend/uploads/` directory
- Files served via Express static middleware
- File paths stored in database for retrieval

## 🔐 Security Considerations

- **Authentication:** JWT tokens for session management
- **Password Hashing:** bcryptjs for secure password storage
- **Access Control:** User-based permissions for reports and vitals
- **File Upload Security:** File type validation and secure file naming
- **CORS:** Configured for cross-origin requests from frontend

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```
   The server will run on http://localhost:5000

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The app will open in your browser at http://localhost:3000

### Database
The SQLite database is automatically created when the backend server starts. The database file is located at `database/health_wallet.db`.

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.
- **Body:** `{ "username": "string", "email": "string", "password": "string" }`
- **Response:** `{ "message": "User registered successfully", "userId": number }`

#### POST /api/auth/login
Login user.
- **Body:** `{ "email": "string", "password": "string" }`
- **Response:** `{ "token": "jwt_token", "user": user_object }`

### Reports Endpoints

#### POST /api/reports/upload
Upload a medical report.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Form data with file and metadata
- **Response:** `{ "message": "Report uploaded successfully", "reportId": number }`

#### GET /api/reports
Get user's reports.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of report objects

#### GET /api/reports/:id/download
Download a specific report.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** File download

### Vitals Endpoints

#### POST /api/vitals
Add a new vital entry.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "vital_type": "string", "value": number, "date": "string" }`
- **Response:** `{ "message": "Vital added successfully", "vitalId": number }`

#### GET /api/vitals
Get user's vitals.
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `type`, `start_date`, `end_date`
- **Response:** Array of vital objects

### Sharing Endpoints

#### POST /api/share
Share a report with another user.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "report_id": number, "shared_with_email": "string", "access_type": "read" }`
- **Response:** `{ "message": "Report shared successfully" }`

#### GET /api/share/shared-with-me
Get reports shared with the user.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of shared report objects

## 🧪 Running the Application

1. Start the backend server:
   ```bash
   cd backend && npm start
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend && npm start
   ```

3. Open http://localhost:3000 in your browser

## 📊 Data Models

### User
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "owner"
}
```

### Report
```json
{
  "id": 1,
  "user_id": 1,
  "filename": "report_123.pdf",
  "original_name": "blood_test.pdf",
  "report_type": "Blood Test",
  "date": "2023-05-15",
  "vitals": "{\"blood_pressure\": \"120/80\", \"sugar\": \"90\"}",
  "uploaded_at": "2023-05-15T10:30:00Z"
}
```

### Vital
```json
{
  "id": 1,
  "user_id": 1,
  "vital_type": "Blood Pressure",
  "value": 120.5,
  "date": "2023-05-15"
}
```

## 🔄 Future Enhancements

- Cloud storage integration (AWS S3, Google Cloud Storage)
- Advanced analytics and health insights
- Mobile app development
- Integration with wearable devices
- Multi-language support
- Advanced sharing with expiration dates

## 📄 License

This project is for educational purposes as part of the 2care.ai assessment.

## Data Structure
careai_assessment/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── routes/
│       ├── auth.js
│       ├── reports.js
│       ├── vitals.js
│       └── share.js
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       └── components/
│           ├── Login.js
│           ├── Register.js
│           ├── Dashboard.js
│           ├── UploadReport.js
│           ├── ViewReports.js
│           ├── Vitals.js
│           └── ShareReport.js
├── database/
│   └── (auto-created)
├── README.md
└── uploads/
    └── (auto-created)