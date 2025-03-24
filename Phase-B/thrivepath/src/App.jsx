import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/HomePage/HomePage";
import SignUp from "./components/HomePage/SignUpPage";
import SignIn from "./components/HomePage/SignInPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  );
}

export default App;
