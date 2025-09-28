import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import History from "./pages/History";
import PayPage from "./pages/PayPage";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/pay/:invoiceId" element={<PayPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
