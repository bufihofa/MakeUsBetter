import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Calendar } from './pages/Calendar';
import { Profile } from './pages/Profile';
import storage from './services/storage';
import fcmService from './services/fcm';
import './App.css';

const theme = createTheme({
  primaryColor: 'pink',
  colors: {
    pink: [
      '#ffeef6', // 0
      '#ffdee9', // 1
      '#ffbdcd', // 2
      '#ff99b1', // 3
      '#ff7a98', // 4
      '#ff6688', // 5
      '#ff5c80', // 6
      '#e6496b', // 7
      '#ce3d5e', // 8
      '#b62e4f', // 9
    ],
  },
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoggedIn] = useState(() => storage.isLoggedIn());

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const [initialLoggedIn] = useState(() => storage.isLoggedIn());

  useEffect(() => {
    // Initialize FCM when app starts
    if (initialLoggedIn) {
      fcmService.init();
    }
  }, [initialLoggedIn]);

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              initialLoggedIn
                ? <Navigate to="/home" replace />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/login"
            element={
              initialLoggedIn
                ? <Navigate to="/home" replace />
                : <Login />
            }
          />
          <Route
            path="/register"
            element={
              initialLoggedIn
                ? <Navigate to="/home" replace />
                : <Register />
            }
          />

          {/* Protected routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
