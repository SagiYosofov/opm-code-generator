import React, { useState } from "react";
import { signupUser } from "../api/auth";
import { toast } from "react-toastify";
import "../styles/Auth.css";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const evaluatePasswordStrength = (password) => {
    if (!password) return "";
    const strongPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const mediumPattern = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
    if (strongPattern.test(password)) return "strong";
    if (mediumPattern.test(password)) return "medium";
    return "weak";
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstname":
        if (!value.trim()) return "First name is required";
        break;
      case "lastname":
        if (!value.trim()) return "Last name is required";
        break;
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) return "Email is invalid";
        break;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        if (formData.confirmPassword && value !== formData.confirmPassword)
          return "Passwords do not match";
        break;
      case "confirmPassword":
        if (!value) return "Confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        break;
      default:
        return "";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      setPasswordStrength(evaluatePasswordStrength(value));
    }

    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });

      // Also validate password/confirmPassword relationship
      if (name === "password" && touched.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateField("confirmPassword", formData.confirmPassword)
        }));
      }
      if (name === "confirmPassword" && touched.password) {
        setErrors((prev) => ({
          ...prev,
          password: validateField("password", formData.password)
        }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res_data = await signupUser({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
      });

      toast.success(res_data.message || "Account created successfully!");

      // Reset fields
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: ""
      });

    } catch (err) {
      toast.error(err.detail || "Signup failed");
    }
  };

  return (
    <div className="page-container">
      <form className="form-box" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
          onBlur={handleBlur}
          className={touched.firstname ? (errors.firstname ? "invalid" : "valid") : ""}
        />
        {errors.firstname && <span className="error">{errors.firstname}</span>}

        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
          onBlur={handleBlur}
          className={touched.lastname ? (errors.lastname ? "invalid" : "valid") : ""}
        />
        {errors.lastname && <span className="error">{errors.lastname}</span>}

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
            className={touched.password ? (errors.password ? "invalid" : "valid") : ""}
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

        {/* Password Strength Meter */}
        {formData.password && (
          <div className={`password-strength ${passwordStrength}`}>
            Password strength: {passwordStrength}
          </div>
        )}

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.confirmPassword ? (errors.confirmPassword ? "invalid" : "valid") : ""}
          />
        </div>
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignupPage;