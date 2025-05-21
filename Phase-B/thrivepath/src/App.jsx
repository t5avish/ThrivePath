import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/HomePage/HomePage";
import SignUp from "./components/HomePage/SignUpPage";
import SignIn from "./components/HomePage/LogInPage";
import SelectPatient from "./components/PatientsPage/SelectPatient";
import AddPatientInfo from "./components/PatientsPage/AddPatientInfo";
import AddPatientHistory from "./components/PatientsPage/AddPatientHistory";
import TreatmentPage from "./components/PatientDashboard/treatment/TreatmentPage";
import TrackingPage from "./components/PatientDashboard/tracking/TrackingPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/select-patient" element={<SelectPatient />} />
        <Route path="/add-patient-info" element={<AddPatientInfo />} />
        <Route path="/add-patient-file" element={<AddPatientHistory />} />
        <Route path="/treatment/:patientId" element={<TreatmentPage />} />
        <Route path="/tracking/:patientId" element={<TrackingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
