import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/HomePage/HomePage";
import SignUp from "./components/HomePage/SignUpPage";
import SignIn from "./components/HomePage/LogInPage";
import SelectPatient from "./components/PatientsPage/SelectPatient";
import AddPatient1 from "./components/PatientsPage/AddPatient1";
import AddPatient2 from "./components/PatientsPage/AddPatient2";
import TreatmentPage from "./components/PatientDashboard/TreatmentPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/select-patient" element={<SelectPatient />} />
        <Route path="/add-patient-info" element={<AddPatient1 />} />
        <Route path="/add-patient-file" element={<AddPatient2 />} />
        <Route path="/treatment/:patientId" element={<TreatmentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
