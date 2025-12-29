import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "./context/UserContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OpmCodeGeneratorPage from "./pages/OpmCodeGeneratorPage";
import OpmSuccessPage from "./pages/OpmSuccessPage";
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
          <Route path="/opm_code_generator" element={<OpmCodeGeneratorPage />} />
          <Route path="/opm_success" element={<OpmSuccessPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<UserProjectsPage />} />
          <Route path="*" element={<Navigate to="/opm_code_generator" />} />
        </>
      )}
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Navbar />
      <AppRoutes />
    </BrowserRouter>
  );
}