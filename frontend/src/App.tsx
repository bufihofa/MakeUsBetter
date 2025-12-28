import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Calendar } from './pages/Calendar';
import { Profile } from './pages/Profile';
import storage from './services/storage';
import fcmService from './services/fcm';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = storage.isLoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // Initialize FCM when app starts
    if (storage.isLoggedIn()) {
      fcmService.init();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            storage.isLoggedIn()
              ? <Navigate to="/home" replace />
              : <Onboarding />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
