import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { refineCode } from "../api/opm";
import "../styles/OpmSuccessPage.css";
import LoadingModal from "../components/LoadingModal";

const OpmSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get state from navigation
  const state = location.state;

  // Validate we have required data
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
      formData.append("file", state.diagramFile);
      formData.append("target_language", state.language);
      formData.append("previous_code", currentCode);
      formData.append("fix_instructions", fixInstructions);

      console.log("Sending refinement request with:", {
        filename: state.diagramFile.name,
        language: state.language,
        instructions: fixInstructions
      });

      const response_data = await refineCode(formData);

      console.log("Refinement Response:", response_data);

      if (response_data.status === "valid") {
        // Success - update code and explanation
        console.log("Refinement successful!");
        setCurrentCode(response_data.code);
        setCurrentExplanation(response_data.explanation);

        // Close fix instructions area
        setShowFixInstructions(false);
        setFixInstructions("");
      } else {
        // Refinement failed - show error explanation, keep previous code
        console.warn("Refinement rejected:", response_data.explanation);
        setRefinementError(response_data.explanation || "Could not apply fix instructions.");
        // Keep fix instructions visible for user to modify
      }
    } catch (err) {
      console.error("Refinement Error:", err);
      const errorMessage = err.detail || err.message || "Failed to refine code";
      setRefinementError(errorMessage);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="page-container">
      <LoadingModal isOpen={isRefining} />

      <div className="success-container">
        {/* Fix Instructions Section - appears above main content when activated */}
        {showFixInstructions && (
          <div className="fix-instructions-section">
            <div className="fix-instructions-header">
              <h2>Add Fix Instructions</h2>
              <p>Describe what changes you'd like to make to the generated code.</p>
            </div>

            <textarea
              className="fix-instructions-textarea"
              placeholder="Enter your fix instructions here..."
              value={fixInstructions}
              onChange={(e) => setFixInstructions(e.target.value)}
              rows="6"
            />

            {refinementError && (
              <div className="refinement-error-alert">
                <p className="error-alert-title">Fix Instructions Could Not Be Applied</p>
                <p className="error-alert-message">{refinementError}</p>
              </div>
            )}

            <div className="fix-instructions-actions">
              <button
                className="action-button send-button"
                onClick={handleSendFixInstructions}
                disabled={isRefining || !fixInstructions.trim()}
              >
                {isRefining ? "Applying..." : "Send"}
              </button>
              <button
                className="action-button cancel-button"
                onClick={handleCancelFixInstructions}
                disabled={isRefining}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main Success Content */}
        <div className="success-content">
          {/* AI Explanation - always visible */}
          <div className="explanation-section">
            <div className="explanation-header">
              <h2>AI Analysis</h2>
              <div className="explanation-badge">Generated</div>
            </div>
            <div className="explanation-text">
              {currentExplanation}
            </div>
          </div>

          {/* Generated Code Display */}
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
              >
                {copyFeedback ? "✓ Copied!" : "📋 Copy Code"}
              </button>
              <button
                className="download-button"
                onClick={handleDownloadCode}
              >
                ⬇️ Download Code
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="success-actions">
            <button
              className="action-button primary-button"
              onClick={() => navigate("/")}
            >
              ↺ Upload New Diagram
            </button>
            <button
              className="action-button secondary-button"
              onClick={handleAddFixInstructions}
              disabled={isRefining}
            >
              ✏️ Add Fix Instructions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpmSuccessPage;