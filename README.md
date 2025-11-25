# 🎓 USF Study Buddy

<div align="center">

**Find your perfect study partner at USF with swipe-based matching**

*A project for HackJam 2025*

[Features](#-features) • [Getting Started](#-getting-started) • [Screenshots](#-screenshots) • [License](#-license)

</div>

---

## 📖 About

USF Study Buddy is a Tinder-style web application designed to help University of South Florida students find compatible study partners. The project was designed for HackJam 2025.


## 🛠 Tech Stack

### Frontend
**React**, **TypeScript**, **Vite**, **React Router DOM 7.9.6**, **Tailwind CSS**

### Backend
**FastAPI**, **SQLite3**, **PyJWT**, **Bcrypt 5.0.0**


## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Poetry (Python package manager)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies with Poetry:
```bash
poetry install
```

3. Create a `.env` file in the root directory (copy from `.env.example`) and change the variables in it:
```bash
cp ../.env.example ../.env
```

4. Start the FastAPI server:
```bash
poetry run python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`


## 📸 Screenshots

### Landing Page
![Landing Page](photos/main.png)

### Sign Up
![Sign Up](photos/signup.png)

### Sign In
![Sign In](photos/signin.png)

### Home - Swipe Interface
![Home](photos/home.png)

### User Card Example
![Card Example](photos/card%20example.png)


## 🎯 Future Enhancements

- Real-time chat/messaging system
- Email notifications for matches
- Advanced filtering (by major, class, study time)
- Study group creation (3+ people)
- Calendar integration for scheduling study sessions
- Rate limiting and API throttling
- Profile pictures with cloud storage
- Match history and statistics
- Mobile app (React Native)


## 🤝 Contributing

This project was created for HackJam 2025. Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with 💚 for USF Bulls**

⭐ Star this repo if you find it helpful!

</div>
