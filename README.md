# ClinicSys - Modern Clinic Management System

![ClinicSys Banner](https://img.shields.io/badge/ClinicSys-Hospital_Management-4F46E5?style=for-the-badge&logo=react)

ClinicSys is a comprehensive, full-stack Clinic Management System designed to streamline hospital workflows, ranging from patient registration and doctor consultations to pharmacy inventory and lab diagnostics. It features a beautiful, modern, glassmorphism-inspired UI built with React and a robust, scalable REST API backend powered by Django.

## 🚀 Features by Role

The system is built around Role-Based Access Control (RBAC), offering dedicated dashboards and workflows for different clinic personnel.

### 🛡️ System Administrator
- **Analytics Dashboard**: Real-time interactive charts (via Recharts) displaying daily patient trends and total revenue.
- **Staff Management**: Complete CRUD operations to hire staff, assign roles, and activate/deactivate accounts.
- **Specializations**: Manage hospital departments and associate them with registered doctors.

### 👩‍💼 Receptionist
- **Patient Management**: Register new patients, manage medical history profiles, and assign membership tiers.
- **Appointment Scheduling**: Book and manage patient appointments with specific doctors across various departments.
- **Queue Management**: Monitor today's active appointments and manage the waiting list.

### 👨‍⚕️ Doctor
- **Consultation Dashboard**: View assigned appointments and patient history.
- **Diagnosis & Prescriptions**: Record symptoms, diagnose illnesses, and seamlessly prescribe medicines with precise dosages, frequencies, and durations.
- **Lab Assignments**: Order specific lab tests for patients directly from the consultation interface.
- **Lab Results Review**: Monitor and review completed lab reports submitted by the Lab Technician.

### 💊 Pharmacist
- **Inventory Management**: Manage medicine categories, update stock levels, and monitor automated "Low Stock" alerts.
- **Smart Dispensing**: View pending prescriptions grouped by appointment. The system intelligently calculates the exact quantity of medicine required based on the doctor's prescribed frequency (e.g., "1-0-1") and duration.
- **Automated Billing**: Instantly generate and print consolidated tax invoices (including 12% GST) while automatically deducting dispensed quantities from the real-time inventory.

### 🔬 Lab Technician
- **Lab Directory**: Define and manage available lab tests, categories, reference ranges, and pricing.
- **Test Evaluations**: Evaluate pending tests ordered by doctors, enter result values, and add clinical remarks.
- **Reporting & Invoicing**: Automatically generate printable Lab Reports and individual Lab Invoices.

---

## 🛠️ Technology Stack

**Frontend:**
- React 19 (Vite)
- CSS3 (Vanilla CSS with Custom Properties, Glassmorphism UI)
- React Router DOM (Navigation)
- Lucide React (Beautiful SVG Icons)
- Recharts (Interactive Analytics)
- Axios (API Integration)

**Backend:**
- Python 3.x
- Django 5.x
- Django REST Framework (DRF)
- SQLite3 (Default database, easily swappable to PostgreSQL)

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/Arjunsanthosh09/clinic-management-system.git
cd clinic-management-system
```

### 2. Backend Setup (Django)
Open a terminal in the project root directory:

```bash
# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install django djangorestframework django-cors-headers

# Apply database migrations
python manage.py makemigrations clinic
python manage.py migrate

# Run the Django development server (runs on http://localhost:8000)
python manage.py runserver
```

### 3. Frontend Setup (React/Vite)
Open a new terminal window in the `frontend` directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the React development server (runs on http://localhost:5173)
npm run dev
```

---

## 🔑 Default Login Credentials

If you populate the database using the provided mock data script or through the admin panel, you can log in using the following formats (Role must be selected correctly in the dropdown):

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `admin` (or created via UI) |
| **Doctor** | `doctor` | (set in Staff Management) |
| **Receptionist** | `reception` | (set in Staff Management) |
| **Pharmacist** | `pharma` | (set in Staff Management) |
| **Lab Technician**| `lab` | (set in Staff Management) |

*(Note: In a production environment, passwords should be securely hashed. The current iteration uses plain-text validation for rapid local demonstration purposes).*

---

## 📸 Application Structure

```text
clinic-management-system/
├── clinic/                 # Django App (Models, Views, Serializers, URLs)
├── clinic_management/      # Django Project Configuration
├── frontend/               # React Vite Application
│   ├── src/
│   │   ├── assets/         # Images, SVGs
│   │   ├── components/     # Layout, Sidebar, Topbar
│   │   ├── context/        # AuthContext for global state
│   │   ├── pages/          # Role-specific Dashboard Views
│   │   ├── api.js          # Axios configuration
│   │   ├── App.jsx         # Routes definition
│   │   └── index.css       # Global styling & Glassmorphism classes
│   └── package.json
├── db.sqlite3              # Local Database
└── manage.py               # Django execution script
```

---

## 🌟 UI/UX Highlights
- **Vibrant Gradients:** Custom linear gradients applied to active states and primary buttons.
- **Glassmorphism Panels:** Semi-transparent panels with backdrop filters provide a highly premium, modern feel.
- **Micro-interactions:** Smooth hover transitions on table rows, buttons, and sidebar links.
- **Print Layouts:** Custom `@media print` CSS for generating clean, professional medical invoices and lab reports directly from the browser.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is licensed under the MIT License.
