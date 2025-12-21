import React, { useState, useRef } from "react";
import { generateCode } from "../api/opm";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import "../styles/OpmCodeGeneratorPage.css";
import LoadingModal from "../components/LoadingModal";


const OpmCodeGeneratorPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [isDragActive, setIsDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  // Validation constants
  const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/jpg"];
  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const LANGUAGE_OPTIONS = [
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" }
  ];

  const validateFile = (fileToValidate) => {
    const newErrors = {};

    // Check file type
    if (!ALLOWED_FORMATS.includes(fileToValidate.type)) {
      const ext = fileToValidate.name.substring(fileToValidate.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        newErrors.file = "Invalid file format. Supported formats: JPG, JPEG, PNG";
        return newErrors;
      }
    }

    // Check file size
    if (fileToValidate.size > MAX_FILE_SIZE) {
      newErrors.file = `File size exceeds 5 MB. Your file is ${(fileToValidate.size / (1024 * 1024)).toFixed(2)} MB`;
      return newErrors;
    }

    return newErrors;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFiles = e.dataTransfer.files;

    // Only accept one file
    if (droppedFiles.length > 1) {
      setErrors({ file: "Please upload only one file at a time" });
      return;
    }

    if (droppedFiles.length === 1) {
      const droppedFile = droppedFiles[0];
      const validationErrors = validateFile(droppedFile);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setFile(null);
      } else {
        setErrors({});
        setFile(droppedFile);
      }
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;

    if (selectedFiles.length > 1) {
      setErrors({ file: "Please upload only one file at a time" });
      return;
    }

    if (selectedFiles.length === 1) {
      const selectedFile = selectedFiles[0];
      const validationErrors = validateFile(selectedFile);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setFile(null);
      } else {
        setErrors({});
        setFile(selectedFile);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setErrors({});
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();

    if (!file) {
      setErrors({ file: "Please upload an OPM diagram" });
      return;
    }

    if (!selectedLanguage) {
      setErrors({ language: "Please select a programming language" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_language", selectedLanguage);

      // Log what we are sending
      console.log("Sending request to backend with:", {
        filename: file.name,
        language: selectedLanguage
      });

      const response_data = await generateCode(formData);

      // Log exactly what came back from Gemini/Backend
      console.log("Full Response from Backend:", response_data);

      if (response_data.status === "valid") {
          console.log("Success! Generated Code Length:", response_data.code?.length);
          // Create a Blob from the code string
          const blob = new Blob([response_data.code], { type: "text/plain" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = response_data.filename; // use filename from backend
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Reset form only on success
          handleRemoveFile();
          setSelectedLanguage("python");

          alert("Code generated successfully!");
    } else { // Diagram invalid
        // Log the AI's reason for invalidation
        console.warn("AI rejected the diagram:", response_data.explanation);
      // Show AI explanation in the UI
      setErrors({ diagram: response_data.explanation || "Diagram is invalid." });
    }
    } catch (err) {
      // NETWORK / SERVER ERRORS
      // Log the specific network or server error
      console.error("Critical Generate Code Error:", err);
      const errorMessage = err.detail || err.message || "Failed to generate code";
      setErrors({ submit: errorMessage });
      console.error("Generate Code error:", err);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="page-container">
      { /* Loading Modal - Shows when isLoading is true */ }
      <LoadingModal isOpen={isLoading}/>

      <div className="opm-upload-container">
        <div className="welcome-section">
          <h1 className="page-title">OPMCodeGenerator</h1>
          {user && (
            <p className="welcome-message">
              Welcome, <span className="user-name">{user.firstname} {user.lastname}</span>! 👋
            </p>
          )}
        </div>

        <form onSubmit={handleGenerateCode} className="upload-form">
          {/* Upload Section */}
          <div className="upload-section">
            <h2 className="section-title">Upload OPM Diagram</h2>

            <div
              className={`drag-drop-area ${isDragActive ? "active" : ""} ${
                file ? "has-file" : ""
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {!file ? (
                <>
                  <div className="upload-icon">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M32 12V44M32 12L22 22M32 12L42 22"
                        stroke="#999"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 48H52C54.2091 48 56 49.7909 56 52V54C56 56.2091 54.2091 58 52 58H12C9.79086 58 8 56.2091 8 54V52C8 49.7909 9.79086 48 12 48Z"
                        stroke="#999"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="drag-text">Drag and drop your OPM diagram here</p>
                  <p className="or-text">or <button
                    type="button"
                    className="browse-button"
                    onClick={handleBrowseClick}
                  >
                    click to browse
                  </button></p>
                  <p className="file-status">No file selected</p>
                </>
              ) : (
                <>
                  <div className="file-info">
                    <div className="file-details">
                      <div className="file-icon">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 48 48"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2H28L36 10V44C36 45.1046 35.1046 46 34 46H12C10.8954 46 10 45.1046 10 44V4C10 2.89543 10.8954 2 12 2Z"
                            fill="#E8F4F8"
                            stroke="#2196F3"
                            strokeWidth="2"
                          />
                          <path d="M28 2V10H36" stroke="#2196F3" strokeWidth="2" />
                          <image
                            href={URL.createObjectURL(file)}
                            x="12"
                            y="14"
                            width="24"
                            height="24"
                            preserveAspectRatio="xMidYMid slice"
                          />
                        </svg>
                      </div>
                      <div className="file-text">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={handleRemoveFile}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </>
              )}
            </div>

            {errors.file && <span className="error-message">{errors.file}</span>}
          </div>

          {/* Language Selection Section */}
          <div className="language-section">
            <h2 className="section-title">Select Programming Language</h2>
            <div className="language-options">
              {LANGUAGE_OPTIONS.map((lang) => (
                <label key={lang.value} className="language-radio">
                  <input
                    type="radio"
                    name="language"
                    value={lang.value}
                    checked={selectedLanguage === lang.value}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  />
                  <span className="radio-label">{lang.label}</span>
                </label>
              ))}
            </div>
            {errors.language && (
              <span className="error-message">{errors.language}</span>
            )}
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            className="generate-button"
            disabled={isLoading || !file}
          >
            {isLoading ? "Generating Code..." : "Generate Code"}
          </button>

          {/* Diagram/AI Explanation Error */}
          {errors.diagram && (
            <div className="error-alert">{errors.diagram}</div>
          )}

          {/* Submit Error Message */}
          {errors.submit && (
            <div className="error-alert">
              <span>{errors.submit}</span>
            </div>
          )}
        </form>

        {/* Requirements Section */}
        <div className="requirements-section">
          <h3 className="requirements-title">Requirements:</h3>
          <ul className="requirements-list">
            <li>Supported image formats: JPG, JPEG, PNG</li>
            <li>Maximum file size: 5MB</li>
          </ul>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default OpmCodeGeneratorPage;