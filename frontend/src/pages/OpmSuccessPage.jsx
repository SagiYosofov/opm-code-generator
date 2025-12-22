import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { refineCode } from "../api/opm";
import LoadingModal from "../components/LoadingModal";
import "../styles/OpmSuccessPage.css";

const OpmSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data passed from OpmCodeGeneratorPage
  const {
    code,
    filename,
    explanation,
    diagramFile,
    language
  } = location.state || {};

  const [isLoading, setIsLoading] = useState(false);
  const [showFixInstructions, setShowFixInstructions] = useState(false);
  const [fixInstructionsText, setFixInstructionsText] = useState("");
  const [currentCode, setCurrentCode] = useState(code);
  const [currentExplanation, setCurrentExplanation] = useState(explanation);
  const [refinementError, setRefinementError] = useState(null);

  // Redirect if no data
  if (!code || !filename || !explanation) {
    return (
      <div className="error-container">
        <p>No code generation data found. Please start over.</p>
        <button onClick={() => navigate("/")}>Back to Upload</button>
      </div>
    );
  }

  // Auto-download function
  const downloadFile = (fileContent, fileName) => {
    const blob = new Blob([fileContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle initial page load - auto-download
  React.useEffect(() => {
    downloadFile(code, filename);
  }, []);

  // Handle sending fix instructions
  const handleSendFixInstructions = async () => {
    if (!fixInstructionsText.trim()) {
      setRefinementError("Please enter fix instructions.");
      return;
    }

    setIsLoading(true);
    setRefinementError(null);

    try {
      const formData = new FormData();
      formData.append("file", diagramFile);
      formData.append("target_language", language);
      formData.append("previous_code", currentCode);
      formData.append("fix_instructions", fixInstructionsText);

      console.log("Sending refinement request with:", {
        language,
        fixInstructions: fixInstructionsText,
        previousCodeLength: currentCode.length
      });

      const response_data = await refineCode(formData);

      console.log("Refinement Response:", response_data);

      if (response_data.status === "valid") {
        // Success - update code and explanation
        setCurrentCode(response_data.code);
        setCurrentExplanation(response_data.explanation);
        setFixInstructionsText("");
        setShowFixInstructions(false);
        setRefinementError(null);

        // Auto-download the refined code
        downloadFile(response_data.code, response_data.filename);

        alert("Code refined successfully!");
      } else {
        // Invalid or error - show explanation but preserve current code
        setCurrentExplanation(response_data.explanation);
        setRefinementError(response_data.explanation);
        // Keep fixInstructionsText visible so user can modify
      }
    } catch (err) {
      console.error("Refinement error:", err);
      const errorMsg = err.detail || err.message || "Failed to refine code";
      setRefinementError(errorMsg);
      setCurrentExplanation(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelFixInstructions = () => {
    setFixInstructionsText("");
    setShowFixInstructions(false);
    setRefinementError(null);
    setCurrentExplanation(explanation); // Restore original explanation
  };

  const handleUploadNewDiagram = () => {
    navigate("/");
  };

  return (
    <div className="success-page-container">
      <LoadingModal isOpen={isLoading} />

      {/* Fix Instructions Panel - Shows above main content when active */}
      {showFixInstructions && (
        <div className="fix-instructions-panel">
          <div className="fix-instructions-content">
            <h3 className="fix-instructions-title">Refine Generated Code</h3>
            <p className="fix-instructions-subtitle">
              Describe what changes you'd like to make to the generated code
            </p>

            <textarea
              className="fix-instructions-textarea"
              placeholder="Example: Add error handling to the main function, or use more descriptive variable names..."
              value={fixInstructionsText}
              onChange={(e) => setFixInstructionsText(e.target.value)}
              rows="5"
            />

            {refinementError && (
              <div className="refinement-error">
                {refinementError}
              </div>
            )}

            <div className="fix-instructions-actions">
              <button
                className="btn btn-primary"
                onClick={handleSendFixInstructions}
                disabled={isLoading || !fixInstructionsText.trim()}
              >
                {isLoading ? "Refining..." : "Send"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCancelFixInstructions}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Success Content */}
      <div className="success-content">
        <div className="success-header">
          <div className="success-icon">✓</div>
          <h1 className="success-title">Code Generated Successfully!</h1>
        </div>

        {/* AI Explanation - Always Visible */}
        <div className="explanation-section">
          <h2 className="explanation-title">AI Analysis & Explanation</h2>
          <div className="explanation-box">
            <p className="explanation-text">{currentExplanation}</p>
          </div>
        </div>

        {/* Generated Code Display */}
        <div className="code-section">
          <div className="code-header">
            <h3 className="code-title">Generated Code</h3>
            <span className="code-filename">{filename}</span>
          </div>
          <pre className="code-display">
            <code>{currentCode}</code>
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={handleUploadNewDiagram}
          >
            Upload New Diagram
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setShowFixInstructions(true);
              setRefinementError(null);
            }}
          >
            Add Fix Instructions
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpmSuccessPage;