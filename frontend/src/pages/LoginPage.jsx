import React, { useState } from "react";
import { loginUser } from "../api/auth";
import { useUser } from "../context/UserContext";
import "../styles/LoginPage.css";


const LoginPage = () => {
  const { login } = useUser(); // get login function from context

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value))
          return "Email is invalid";
        break;
      case "password":
        if (!value) return "Password is required";
        break;
      default:
        return "";
    }
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res_data = await loginUser(formData);

      login(res_data.user); // save logged-in user to context

      alert(res_data.message);
      setFormData({ email: "", password: "" });

    } catch (err) {
      alert(err.detail || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={touched.email ? (errors.email ? "invalid" : "valid") : ""}
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={
              touched.password ? (errors.password ? "invalid" : "valid") : ""
            }
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {errors.password && <span className="error">{errors.password}</span>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
