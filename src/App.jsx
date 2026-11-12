import { Navigate, Route, Routes } from 'react-router-dom'
import { Stage } from './components/Motion'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import ClientApp from './pages/ClientApp'
import AdminApp from './pages/AdminApp'

export default function App() {
  return (
    <>
    <Stage />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/#start" replace />} />
      <Route path="/app" element={<ClientApp />} />
      <Route path="/admin" element={<AdminApp />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </>
  )
}
