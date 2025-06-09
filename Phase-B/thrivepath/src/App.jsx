import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/landing/HomePage";
import SignUp from "./components/landing/SignUpPage";
import SignIn from "./components/landing/LogInPage";
import SelectPatient from "./components/user/SelectPatient";
import AddPatientInfo from "./components/user/AddPatientInfo";
import AddPatientHistory from "./components/user/AddPatientHistory";
import TreatmentPage from "./components/patient/treatment/TreatmentPage";
import TrackingPage from "./components/patient/tracking/TrackingPage";


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
