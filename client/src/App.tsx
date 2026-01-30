import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patient/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import FindDoctor from './pages/patient/FindDoctor';
import NearbyHospitals from './pages/patient/NearbyHospitals';
import BloodDonation from './pages/patient/BloodDonation';
import AdminDashboard from './pages/admin/Dashboard';
import EmergencyResponderDashboard from './pages/admin/EmergencyResponderDashboard';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/emergency-responder-dashboard" element={<EmergencyResponderDashboard />} />
          <Route path="/find-doctor" element={<FindDoctor />} />
          <Route path="/nearby-hospitals" element={<NearbyHospitals />} />
          <Route path="/blood-donation" element={<BloodDonation />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
