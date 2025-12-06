import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import InstructorsPage from './pages/InstructorsPage'
import LessonsPage from './pages/LessonsPage'
import LessonDetailsPage from './pages/LessonDetailsPage'
import BookingsPage from './pages/BookingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { AuthProvider } from './auth/AuthContext'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/instructors" element={<InstructorsPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lessons/:id" element={<LessonDetailsPage />} />
          <Route path="/bookings" element={<BookingsPage />} />

          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/cadastrar" element={<RegisterPage />} />
        </Routes>
      </main>
    </AuthProvider>
  )
}

export default App
