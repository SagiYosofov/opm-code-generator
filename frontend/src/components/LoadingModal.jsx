import React, { useState, useEffect, useRef } from "react";
import "../styles/LoadingModal.css";

const LoadingModal = ({ isOpen }) => {
  const [loadingMessage, setLoadingMessage] = useState("Processing your OPM diagram...");
  const timeoutRef = useRef(null);
  const stageIndexRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;

    const stages = [
      { message: "Processing your OPM diagram...", duration: 3000 },
      { message: "Analyzing diagram structure...", duration: 15000 },
      { message: "Extracting OPM elements...", duration: 15000 },
      { message: "Generating code with AI...", duration: 120000 },
      { message: "Finalizing output...", duration: 10000 },
    ];

    stageIndexRef.current = 0;
    setLoadingMessage(stages[0].message);

    const processStages = () => {
      // Move to next stage if available
      if (stageIndexRef.current < stages.length - 1) {
        stageIndexRef.current += 1;
        setLoadingMessage(stages[stageIndexRef.current].message);
        timeoutRef.current = setTimeout(
          processStages,
          stages[stageIndexRef.current].duration
        );
      }
    };

    // Start first stage timer
    timeoutRef.current = setTimeout(processStages, stages[0].duration);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>

        <h2 className="loading-title">Generating Your Code</h2>
        <p className="loading-message">{loadingMessage}</p>

        <div className="time-estimate">
          <p className="estimate-text">
            ⏱️ This may take up to <span className="estimate-highlight">3 minutes</span>
          </p>
          <p className="estimate-subtext">Please do not close this window</p>
        </div>

        <div className="loading-progress">
          <div className="progress-bar-animated"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
