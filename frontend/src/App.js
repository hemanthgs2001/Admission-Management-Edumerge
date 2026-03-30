import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Masters from './pages/Masters';
import Applicants from './pages/Applicants';
import ApplicantForm from './pages/ApplicantForm';
import ApplicantDetail from './pages/ApplicantDetail';
import Layout from './components/Layout';

// Route wrapper component for role-based access
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Masters - Only Admin */}
        <Route 
          path="masters" 
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <Masters />
            </RoleBasedRoute>
          } 
        />
        
        {/* Applicants - Only Admission Officer */}
        <Route 
          path="applicants" 
          element={
            <RoleBasedRoute allowedRoles={['admission_officer']}>
              <Applicants />
            </RoleBasedRoute>
          } 
        />
        
        <Route 
          path="applicants/new" 
          element={
            <RoleBasedRoute allowedRoles={['admission_officer']}>
              <ApplicantForm />
            </RoleBasedRoute>
          } 
        />
        
        {/* Edit route - needs to be before the :id route to avoid conflicts */}
        <Route 
          path="applicants/:id/edit" 
          element={
            <RoleBasedRoute allowedRoles={['admission_officer']}>
              <ApplicantForm />
            </RoleBasedRoute>
          } 
        />
        
        <Route 
          path="applicants/:id" 
          element={
            <RoleBasedRoute allowedRoles={['admission_officer']}>
              <ApplicantDetail />
            </RoleBasedRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;