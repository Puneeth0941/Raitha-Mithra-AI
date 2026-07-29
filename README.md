<div align="center">

# 🌾 Raitha Mithra AI

### AI-Powered Smart Agriculture Management Platform

A modern full-stack web application that helps farmers digitally manage agricultural operations through intelligent record keeping, weather insights, market price monitoring, and AI-assisted decision making.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)

</div>

---

# 📖 Overview

Raitha Mithra AI is an intelligent farm management platform designed to simplify day-to-day agricultural operations through digital record management and AI-powered assistance.

The application enables farmers to maintain farm records, monitor income and expenses, store bills digitally, view weather conditions, track market prices, and interact with an AI assistant for agricultural guidance.

The platform follows a modern client-server architecture with a React frontend, FastAPI backend, PostgreSQL database, and cloud deployment using Vercel and Render.

---

# ✨ Key Features

### Authentication
- Secure JWT-based authentication
- User registration and login
- Protected application routes

### Dashboard
- Overview of farming activities
- Financial summaries
- Quick access to major modules

### Farm Management
- Create and manage farms
- Store crop information
- Organize farm records

### Income Management
- Record farm income
- Categorize revenue
- Financial tracking

### Expense Management
- Track operational expenses
- Expense categorization
- Cost analysis

### Bill Management
- Upload and store bills
- Digital document management
- Organized record keeping

### Weather Module
- Current weather information
- Weather-based farming insights

### Market Prices
- View agricultural market prices
- Assist farmers in selling decisions

### AI Assistant
- Conversational farming assistant
- Agriculture-related guidance
- Intelligent recommendations

---

# 🏗 System Architecture

```
                        User
                          │
                          ▼
                 React + TypeScript
                    (Frontend)
                          │
                     REST API
                       Axios
                          │
                          ▼
                  FastAPI Backend
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
    PostgreSQL Database             AI Services
```

---

# 🛠 Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | FastAPI |
| ORM | SQLAlchemy |
| Authentication | JWT |
| Database | PostgreSQL |
| API Communication | Axios |
| Deployment | Vercel + Render |

---

# 📁 Project Structure

```
Raitha-Mithra-AI/
│
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Raitha-Mithra-AI.git

cd Raitha-Mithra-AI
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend will run at

```
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend will run at

```
http://localhost:5173
```

---

# ⚙ Environment Variables

## Backend

Create a `.env` file.

```env
DATABASE_URL=

SECRET_KEY=

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## Frontend

Create a `.env` file.

```env
VITE_API_URL=http://localhost:8000
```

---

# 📡 REST API Overview

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /register | Register user |
| POST | /login | User login |
| GET | /dashboard | Dashboard data |
| GET | /farms | Fetch farms |
| POST | /farms | Add farm |
| GET | /income | Income records |
| POST | /income | Add income |
| GET | /expense | Expense records |
| POST | /expense | Add expense |
| GET | /weather | Weather information |
| GET | /market | Market prices |
| POST | /ai/chat | AI Assistant |

---

# 📸 Screenshots

Add screenshots of:

- Login Page
- Dashboard
- Farm Management
- Income Module
- Expense Module
- Bills Module
- Weather Module
- Market Prices
- AI Assistant

Example:

```
screenshots/
│
├── login.png
├── dashboard.png
├── farms.png
├── income.png
├── expense.png
├── bills.png
├── weather.png
├── market.png
└── ai.png
```

---

# 🚀 Deployment

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | PostgreSQL |

---

# 🗺 Roadmap

- [x] User Authentication
- [x] Dashboard
- [x] Farm Management
- [x] Income Tracking
- [x] Expense Tracking
- [x] Digital Bill Management
- [x] Weather Module
- [x] Market Prices
- [x] AI Assistant
- [ ] Mobile Responsive UI
- [ ] Multi-language Support
- [ ] Crop Disease Detection
- [ ] Yield Prediction
- [ ] Push Notifications

---

# 🤝 Contributing

Contributions, feature requests, and suggestions are welcome.

If you would like to contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Puneeth**

Bachelor of Engineering — Artificial Intelligence & Machine Learning

GitHub: https://github.com/YOUR_USERNAME

LinkedIn: https://linkedin.com/in/YOUR_LINKEDIN

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star.

</div>
