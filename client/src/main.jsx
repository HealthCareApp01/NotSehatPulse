import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './index.css';

console.log("Hello from main.jsx");
console.log("Root element exists?", !!document.getElementById('root'));

window.onerror = function(message, source, lineno, colno, error) {
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
          <Route path="/doctor-dashboard" element={
            <DashboardLayout>
              <DoctorDashboard />
            </DashboardLayout>
          } />
          
          <Route path="/patient-dashboard" element={
            <DashboardLayout>
              <PatientDashboard />
            </DashboardLayout>
          } />

          <Route path="/ai-symptom-checker" element={
            <DashboardLayout>
              <AISymptomChecker />
            </DashboardLayout>
          } />

          <Route path="/pharmacy" element={
            <DashboardLayout>
              <PharmacyAndLabs />
            </DashboardLayout>
          } />

          <Route path="/chat" element={
            <DashboardLayout>
              <ChatAndConsult />
            </DashboardLayout>
          } />
        </Routes>
      </Router>
    </Provider>
  </React.StrictMode>
);
