import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute   from './components/ProtectedRoute'
import Navbar    from './components/Navbar'
import Footer    from './components/Footer'
import Home      from './pages/Home'
import About     from './pages/About'
import Services  from './pages/Services'
import Gallery   from './pages/Gallery'
import Contact   from './pages/Contact'
import JobForm   from './pages/JobForm'
import Register  from './pages/Register'
import Login           from './pages/Login'
import ForgotPassword  from './pages/ForgotPassword'
import Profile         from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"          element={<Home />}     />
          <Route path="/about"     element={<About />}    />
          <Route path="/services"  element={<Services />} />
          <Route path="/gallery"   element={<Gallery />}  />
          <Route path="/contact"   element={<Contact />}  />
          <Route path="/jobs"      element={<JobForm />}  />
          <Route path="/register"  element={<Register />} />
          <Route path="/login"            element={<Login />}           />
          <Route path="/forgot-password" element={<ForgotPassword />}  />
          {/* Protected: must be logged in */}
          <Route path="/profile"   element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}
