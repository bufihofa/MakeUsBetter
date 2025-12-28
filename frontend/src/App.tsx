import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Calendar } from './pages/Calendar';
import { Profile } from './pages/Profile';
import { MainLayout } from './components/Layout/MainLayout';
import storage from './services/storage';
import fcmService from './services/fcm';
import './App.css';

const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    primary: [
      '#fff0f6', // 0
      '#ffdeeb', // 1
      '#fcc2d7', // 2
      '#faa2c1', // 3
      '#f783ac', // 4
      '#f06595', // 5
      '#e64980', // 6
      '#d6336c', // 7
      '#c2255c', // 8
      '#a61e4d', // 9
    ],
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        fw: 500,
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
        },
      },
    },
    Card: {
      defaultProps: {
        withBorder: true,
        shadow: 'sm',
        radius: 'md',
        bg: 'var(--mantine-color-body)',
      },
    },
    Paper: {
      defaultProps: {
        withBorder: true,
        shadow: 'sm',
        radius: 'md',
      },
    },
    AppShell: {
      styles: {
        main: {
          backgroundColor: 'var(--mantine-color-gray-0)',
        },
      },
    },
  },
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
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-center" zIndex={1000} />
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
          <Route element={<MainLayout />}>
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
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
