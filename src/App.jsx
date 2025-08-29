import React from 'react'
import { BrowserRouter as Router, Routes,Route} from 'react-router-dom'
import AuthProvider from './context/AuthContext'
import ProtectedRoute from './util/ProtectedRoutes'
import AdminDashboard from './components/AdminDashboard'
import TeachersDashboard from './components/TeachersDashboard'
import Unauthorized from './components/Unauthorized'
import { ToastContainer } from 'react-toastify'
import Login from './components/Login'
import GlobalLoading from './components/GlobalLoading'


import './App.css'


function App() {
 
  return(
    <AuthProvider>
      <ToastContainer/>
      <GlobalLoading />
      <Router>
        <Routes>
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role='admin'>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Login />} />
          <Route 
            path="/teacher" 
            element={
              <ProtectedRoute role='teacher'>
                <TeachersDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/unauthorized" element={<Unauthorized/>} />
        </Routes>
      </Router>
    </AuthProvider>
  )

  }

export default App
