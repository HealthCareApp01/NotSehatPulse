import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
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
import './index.css';

console.log("Hello from main.jsx");
console.log("Root element exists?", !!document.getElementById('root'));

window.onerror = function (message, source, lineno, colno, error) {
  console.log("GLOBAL ERROR:", message, error);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />

          {/* Dashboard Routes */}
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
            path="/medicines"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PharmacyAndLabs />
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

          <Route path="/contact-us" element={<ContactUs />} />
        </Routes>
      </Router>
    </Provider>
  </React.StrictMode>
);
