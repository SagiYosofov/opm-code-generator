import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { refineCode } from "../api/opm";
import "../styles/OpmSuccessPage.css";
import LoadingModal from "../components/LoadingModal";

const OpmSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read state passed via React Router from previous page
  const state = location.state;

  // If state is missing or invalid, show an error message
  if (!state || !state.code || !state.explanation) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>Error: Missing Data</h2>
          <p>No code generation data found. Please generate code first.</p>
          <button className="action-button" onClick={() => navigate("/")}>
            Return to Code Generator
          </button>
        </div>
      </div>
    );
  }

  const [currentCode, setCurrentCode] = useState(state.code);
  const [currentExplanation, setCurrentExplanation] = useState(state.explanation);
  const [showFixInstructions, setShowFixInstructions] = useState(false);
  const [fixInstructions, setFixInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refinementError, setRefinementError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);

  const downloadCode = (code, filename) => {
    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 1500);
  };

  const handleDownloadCode = () => {
    downloadCode(currentCode, state.filename);
  };

  const handleAddFixInstructions = () => {
    setShowFixInstructions(true);
    setRefinementError("");
    setFixInstructions("");
  };

  const handleCancelFixInstructions = () => {
    setShowFixInstructions(false);
    setFixInstructions("");
    setRefinementError("");
  };

  const handleSendFixInstructions = async () => {
    if (!fixInstructions.trim()) {
      setRefinementError("Please enter fix instructions");
      return;
    }

    setIsRefining(true);
    setRefinementError("");

    try {
      const formData = new FormData();
      formData.append("generation_id", state.generationId);
      formData.append("file", state.diagramFile);
      formData.append("target_language", state.language);
      formData.append("previous_code", currentCode);
      formData.append("fix_instructions", fixInstructions);

      const response_data = await refineCode(formData);

      if (response_data.status === "valid") {
        setCurrentCode(response_data.code);
        setCurrentExplanation(response_data.explanation);
        setShowFixInstructions(false);
        setFixInstructions("");
      } else {
        setRefinementError(response_data.explanation || "Could not apply fix instructions.");
      }
    } catch (err) {
      const errorMessage = err.detail || err.message || "Failed to refine code";
      setRefinementError(errorMessage);
    } finally {
      setIsRefining(false);
    }
  };

  // Reusable upload button component
  const uploadButton = (
    <button
      className="action-button primary-button upload-button-below"
      onClick={() => navigate("/")}
      aria-label="Upload a new OPM diagram for code generation"
    >
      ↺ Upload New Diagram
    </button>
  );

  return (
    <div className="page-container">
      <LoadingModal isOpen={isRefining} />

      <div className="success-container">
        <div className="success-content">
          {/* AI Explanation */}
          <div className="explanation-section">
            <div className="explanation-header">
              <h2>AI Analysis</h2>
              <div className="explanation-badge">Generated</div>
            </div>
            <div className="explanation-text">{currentExplanation}</div>
          </div>

          {/* Generated Code */}
          <div className="code-section">
            <div className="code-header">
              <h2>Generated Code</h2>
              <span className="code-language">{state.language.toUpperCase()}</span>
            </div>
            <div className="code-display">
              <pre>
                <code>{currentCode}</code>
              </pre>
            </div>
            <div className="code-actions">
              <button
                className={`copy-button ${copyFeedback ? "feedback" : ""}`}
                onClick={handleCopy}
                aria-label="Copy generated code to clipboard"
              >
                {copyFeedback ? "✓ Copied!" : "📋 Copy Code"}
              </button>
              <button
                className="download-button"
                onClick={handleDownloadCode}
                aria-label={`Download generated code as ${state.language} file`}
              >
                ⬇️ Download Code
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="success-actions-wrapper">
            {!showFixInstructions && (
              <div className="success-actions">
                <button
                  className="action-button primary-button"
                  onClick={() => navigate("/")}
                  aria-label="Upload a new OPM diagram for code generation"
                >
                  ↺ Upload New Diagram
                </button>
                <button
                  className="action-button secondary-button"
                  onClick={handleAddFixInstructions}
                  disabled={isRefining}
                  aria-label="Add fix instructions to refine the generated code"
                >
                  ✏️ Add Fix Instructions
                </button>
              </div>
            )}

            {showFixInstructions && (
              <>
                <div className="inline-fix-instructions">
                  <div className="inline-fix-header">
                    <h3>Add Fix Instructions</h3>
                    <p>Describe what changes you'd like to make to the generated code.</p>
                  </div>

                  <textarea
                    className="fix-instructions-textarea"
                    placeholder="Enter your fix instructions here..."
                    value={fixInstructions}
                    onChange={(e) => setFixInstructions(e.target.value)}
                    rows="6"
                    autoFocus
                    aria-label="Enter instructions for refining the code"
                  />

                  {refinementError && (
                    <div className="refinement-error-alert" role="alert">
                      <p className="error-alert-title">Fix Instructions Could Not Be Applied</p>
                      <p className="error-alert-message">{refinementError}</p>
                    </div>
                  )}

                  <div className="inline-fix-actions">
                    <button
                      className="action-button send-button"
                      onClick={handleSendFixInstructions}
                      disabled={isRefining || !fixInstructions.trim()}
                      aria-label="Send fix instructions to refine the code"
                    >
                      {isRefining ? "Applying..." : "Send"}
                    </button>
                    <button
                      className="action-button cancel-button"
                      onClick={handleCancelFixInstructions}
                      disabled={isRefining}
                      aria-label="Cancel and discard fix instructions"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {uploadButton}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpmSuccessPage;