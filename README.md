# Admission-Management-Edumerge

A full-stack **Admission Management System** built for educational institutions to streamline the entire admission process — from institution setup to student enrollment — with role-based access for Admin, Officer, and Management users.

---

## Repository

**Repository Name:** `Admission-Management-Edumerge`

---

## Prerequisites

Make sure you have the following installed before proceeding:

- [Node.js](https://nodejs.org/) (v16 or above)
- [MongoDB](https://www.mongodb.com/) (running locally or via Atlas)
- npm (comes with Node.js)

---

## Database Configuration

This project uses **MongoDB** as its database. Ensure MongoDB is running locally and update the connection URI in your backend environment configuration (`.env` file or config file):

```
MONGODB_URI=mongodb://localhost:27017/admission_management
```

---

## Installation & Running the Application

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/Admission-Management-Edumerge.git
cd Admission-Management-Edumerge
```

---

### Step 2 — Install & Run the Backend

Navigate to the backend folder, install all dependencies, then start the development server:

```bash
cd backend
npm install
npm run dev
```

The backend server will start (typically on `http://localhost:5000` or as configured).

---

### Step 3 — Install & Run the Frontend

Open a new terminal, navigate to the frontend folder, install dependencies, then start the application:

```bash
cd frontend
npm install
npm start
```

The frontend will launch at `http://localhost:3000`.

---

## Login Credentials

The system supports three user roles, each with different levels of access. Use the following credentials to log in:

| Role       | Username   | Password      |
|------------|------------|---------------|
| Admin      | admin      | admin123      |
| Officer    | officer    | officer123    |
| Management | management | management123 |

---

## Features & Role-Based Access

### 1. Admin

The Admin has the highest level of access in the system.

- **Dashboard Access:** The Admin can view the full Dashboard, which displays a real-time overview of admission progress. This includes the Total Intake (total available seats), Total Admitted students, Remaining Seats, and Pending Documents that need verification. The dashboard also includes an Admission Status pie chart showing the percentage of seats filled versus remaining, as well as a Quota-wise Seat Filling bar chart breaking down admissions by quota category (KCET, COMEDK, Management).

- **Masters Configuration:** The Admin is the only role with access to the **Masters** section. This is a step-by-step configuration wizard with four tabs — Institution, Campus, Department, and Program — used to set up the institutional hierarchy before admissions begin.

  - **Institution:** The Admin can create an Institution by providing the Institution Name and Institution Code (e.g., PESITM, ABCE). The institution code is used in generating admission numbers in the format `CODE/2026/UG/CSE/KCET/0001`. All existing institutions are listed in the Existing Records table below the form.

  - **Campus:** After creating an institution, the Admin can add Campuses under it by providing a Campus Name and selecting the parent Institution from a dropdown. For example, "South Campus" under "PESITM". All existing campuses are shown in the records table with their linked institution and number of departments.

  - **Department:** The Admin can create Departments under a specific Campus by providing a Department Name and selecting the Campus from a dropdown. For example, "Computer Science" under "South Campus". Existing departments are shown with their campus and number of linked programs.

  - **Program:** Finally, the Admin can create Programs under a Department. This involves filling in the Program Name (e.g., Computer Science and Engineering), Program Code (e.g., CSE), selecting the Department, specifying the Academic Year, Course Type, Entry Type, Total Intake (total number of seats), and quota-wise seat distribution across KCET, COMEDK, and Management quotas. The total of all quota seats must equal the Total Intake.

---

### 2. Officer (Admission Officer)

The Admission Officer handles the end-to-end student application and admission workflow.

- **Program Access:** The Officer can view the available programs set up by the Admin and initiate the admissions process against them.

- **Create Application:** The Officer can create a new student application by selecting the appropriate Program and Quota (KCET, COMEDK, or Management) through an application form. This captures all necessary student details.

- **Document Verification:** Once an application is submitted, the Officer is responsible for reviewing and verifying the supporting documents uploaded by the student. Documents are marked as verified upon review.

- **Fees Verification:** After document verification, the Officer verifies whether the admission fee has been paid by the student. The fee payment status is updated in the system accordingly.

- **Admission Number Generation:** Once documents are verified and fees are confirmed as paid, the system automatically generates a unique Admission Number for the student. The admission number follows the format: `CODE/YEAR/LEVEL/DEPARTMENT/QUOTA/SERIAL` (e.g., `PESITM/2026/UG/CSE/KCET/0001`).

---

### 3. Management

The Management role has read-only access limited to high-level oversight.

- **Dashboard Access Only:** Management users can log in and view the Dashboard to monitor the overall admission status. They can see summary statistics such as Total Intake, Total Admitted students, Remaining Seats, Pending Documents, the Admission Status pie chart, and Quota-wise Seat Filling bar chart. They cannot create, edit, or delete any records and do not have access to the Masters configuration or application management sections.

---

## Application Workflow Summary

The typical end-to-end flow in the system works as follows:

1. **Admin** logs in and sets up the institutional hierarchy via Masters: Institution → Campus → Department → Program (with seat intake and quota distribution).
2. **Admission Officer** logs in, creates student applications by selecting the program and quota, then processes each application through document verification and fee confirmation.
3. Once both verifications are complete, the system generates a unique **Admission Number** for the admitted student.
4. **Management** can log in at any point to view the Dashboard and monitor overall admission progress and seat-filling statistics in real time.

---

## Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | React.js            |
| Backend   | Node.js + Express   |
| Database  | MongoDB             |
| Styling   | Tailwind CSS / Custom dark theme |

---
AI Tool Disclosure:
I have used AI tools (ChatGPT & Visual Studio Code Copilot) to assist with code structuring, debugging, and improving code readability. All core logic, implementation decisions, and overall architecture were designed and developed by me.

## Notes

- Make sure MongoDB is running before starting the backend server.
- The frontend runs on port `3000` and the backend on its configured port (update API base URL in the frontend if needed).
- Quota seat totals in the Program form must exactly equal the Total Intake value, or the form will not submit.
- Each admission number is unique and auto-generated based on the institution code, academic year, program, and quota.