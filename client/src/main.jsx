import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AISymptomChecker from './pages/AISymptomChecker';
import PharmacyAndLabs from './pages/PharmacyAndLabs';
import ChatAndConsult from './pages/ChatAndConsult';
import ContactUs from './pages/ContactUs';
import FindDoctors from './pages/FindDoctors';
import Pharmacy from './pages/Pharmacy';
import Labs from './pages/Labs';
import ProtectedRoute from './components/ProtectedRoute';
import Appointment from './pages/Appointement';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import VideoConsultation from './pages/VideoConsultation';
import './index.css';

console.log("Hello from main.jsx");
console.log("Root element exists?", !!document.getElementById('root'));

window.onerror = function (message, source, lineno, colno, error) {
  console.log("GLOBAL ERROR:", message, error);
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', backgroundColor: '#fee2e2', minHeight: '100vh', color: '#991b1b' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Something went wrong.</h1>
          <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', background: '#fef2f2', padding: '1rem' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
      <Provider store={store}>
        <Router>
          <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />

          {/* Dashboard Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DoctorDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PatientDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-symptom-checker"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AISymptomChecker />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pharmacy"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PharmacyAndLabs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ChatAndConsult />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/find-doctors"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <FindDoctors />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/labs"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Labs />
                </DashboardLayout>
              </ProtectedRoute>
            } />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Appointment />
                </DashboardLayout>
              </ProtectedRoute>
            } />

          <Route
            path="/consultation/:roomId"
            element={
              <ProtectedRoute>
                <VideoConsultation />
              </ProtectedRoute>
            } />

          <Route path="/contact-us" element={<ContactUs />} />
        </Routes>
      </Router>
    </Provider>
    </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
