import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OpmUploadPage from "./pages/OpmUploadPage";
import AboutPage from "./pages/AboutPage";
import UserProjectsPage from "./pages/UserProjectsPage";

const AppRoutes = () => {
  const { user } = useUser();

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          <Route path="/opm_upload" element={<OpmUploadPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<UserProjectsPage />} />
          <Route path="*" element={<Navigate to="/opm_upload" />} />
        </>
      )}
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes />
    </BrowserRouter>
  );
}
