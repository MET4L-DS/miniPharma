# Medical Shop Management System (Pharmacy DBMS)

A comprehensive web-based pharmacy management system designed for medical stores in India. This project is part of MCA coursework and provides a complete solution for inventory management, billing, medicine tracking, and customer service automation.

## 🏥 Project Overview

The Medical Shop Management System is a full-stack web application that automates key pharmacy operations including inventory management, billing, alternative medicine suggestions, and customer relationship management. The system helps pharmacists and store managers make informed decisions through data-driven insights and alerts.

## 🚀 Features

### 📋 Core Functionality

-   **Medicine Management**: Add, edit, delete, and search medicines with detailed information
-   **Stock/Batch Management**: Track medicine batches with expiry dates, quantities, and pricing
-   **Inventory Tracking**: Real-time stock monitoring with low stock and expiry alerts
-   **Search & Suggestions**: Advanced medicine search with API integration for suggestions
-   **Category Management**: Organize medicines by therapeutic categories
-   **Prescription Tracking**: Manage prescription-required vs OTC medicines

### 📊 Dashboard & Analytics

-   **Interactive Dashboard**: Overview of key metrics and statistics
-   **Stock Alerts**: Low stock, out of stock, and expiring medicines notifications
-   **Category Distribution**: Visual representation of medicine categories
-   **Real-time Updates**: Live data refresh for accurate inventory status

### 🎨 User Interface

-   **Modern UI**: Built with ShadCN UI components and Tailwind CSS
-   **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
-   **Dark/Light Theme**: Toggle between themes for better user experience
-   **Intuitive Navigation**: Easy-to-use interface with clear navigation patterns

### 🔍 Advanced Features

-   **Medicine Search API**: External API integration for medicine suggestions
-   **Batch Tracking**: Complete batch lifecycle management
-   **Expiry Management**: Automated alerts for medicines nearing expiry
-   **GST & HSN Code Support**: Indian tax compliance features
-   **Print Functionality**: Generate and print reports

## 🛠️ Tech Stack

### Frontend

-   **Framework**: React 19 with TypeScript
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS v4.1.4
-   **UI Components**: ShadCN UI (Radix UI primitives)
-   **State Management**: React Hooks
-   **Routing**: React Router DOM v7
-   **Forms**: React Hook Form with Zod validation
-   **Icons**: Lucide React
-   **Date Handling**: date-fns
-   **Notifications**: Sonner (Toast notifications)
-   **Theming**: next-themes

### Backend

-   **Framework**: Django 5.2
-   **API**: Django REST Framework
-   **Database**: MySQL
-   **CORS**: django-cors-headers
-   **Authentication**: Django's built-in auth system

### Development Tools

-   **Language**: TypeScript
-   **Linting**: ESLint v9
-   **Type Checking**: TypeScript ~5.7.2
-   **Package Manager**: npm
-   **Version Control**: Git

## 📁 Project Structure

```
projectDBMS/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # ShadCN UI components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── medicine/   # Medicine-related components
│   │   │   └── stock/      # Stock management components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── contexts/       # React contexts
│   └── package.json
├── medical_shop/            # Django backend
│   ├── api/                # API app
│   ├── medical_shop/       # Main Django project
│   └── manage.py
├── database_script_rwu.sql  # Database schema
├── create_database.sql     # Database creation script
└── README.md
```

## 🚦 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   Python (v3.8 or higher)
-   Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd medical_shop
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Environment Setup

1. Clone the repository
2. Set up the frontend by running `npm install` in the `frontend` directory
3. Set up the backend by installing Python dependencies and running migrations
4. Start both servers (frontend on port 5173, backend on port 8000)

## 🎯 Key Achievements

-   **Responsive Design**: Fully responsive interface working across all device sizes
-   **Modern UI/UX**: Clean, intuitive interface built with modern design principles
-   **Type Safety**: Full TypeScript implementation for better code quality
-   **Component Architecture**: Modular, reusable component structure
-   **API Integration**: Seamless frontend-backend communication
-   **Real-time Updates**: Live data synchronization
-   **Error Handling**: Comprehensive error handling and user feedback

## 📝 Academic Context

This project is developed as part of MCA (Master of Computer Applications) coursework, demonstrating:

-   Full-stack web development skills
-   Database design and management
-   API development and integration
-   Modern frontend frameworks
-   Software engineering best practices
-   Real-world application development

## 🔮 Future Enhancements

-   User authentication and role-based access control
-   Advanced reporting and analytics
-   Barcode scanning integration
-   SMS/Email notifications
-   Multi-store support
-   Mobile app development
-   Payment gateway integration
-   Advanced inventory forecasting

## 📄 License

This project is part of academic coursework. Please refer to the LICENSE file for more details.

## 🤝 Contributing

This is an academic project. For suggestions or improvements, please create an issue or contact the development team.

---

**Developed as part of MCA coursework** | **Focus**: Database Management Systems & Web Development
