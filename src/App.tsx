import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DebugLogPage from './pages/DebugLogPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import { LayoutProvider } from './context/LayoutContext';
import { AuthProvider, RequireAuth } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LayoutProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Layout />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/logs" element={<DebugLogPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminPage />
                </RequireAuth>
              }
            />
          </Routes>
        </LayoutProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;