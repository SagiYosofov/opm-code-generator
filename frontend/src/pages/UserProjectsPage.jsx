import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import {
  getUserProjects,
  downloadDiagram,
  downloadCode,
  deleteProject
} from "../api/projects";
import "../styles/UserProjectsPage.css";

const UserProjectsPage = () => {
  const { user } = useUser();
  const [projects, setProjects] = useState([]); // Array of user projects from the backend.
  const [loading, setLoading] = useState(true); // True while data is are being fetched from backend.
  const [selectedProject, setSelectedProject] = useState(null); // Stores the project the user wants to view in modal.
  const [showModal, setShowModal] = useState(false); // Boolean to toggle the modal display.

  // Fetch projects on component mount
  useEffect(() => {
    if (user?.email) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
      // retrieve all projects for the user.
    setLoading(true);
    try {
      const data = await getUserProjects(user.email);
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.detail || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (project) => {
    // Opens a modal with AI explanation and code.
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleDownloadDiagram = async (generationId, filename) => {
    try {
      await downloadDiagram(generationId, filename);
      toast.success("Diagram downloaded successfully!");
    } catch (error) {
      toast.error(error.detail || "Failed to download diagram");
    }
  };

  const handleDownloadCode = async (generationId, filename) => {
    try {
      await downloadCode(generationId, filename);
      toast.success("Code downloaded successfully!");
    } catch (error) {
      toast.error(error.detail || "Failed to download code");
    }
  };

  const handleDeleteProject = async (generationId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await deleteProject(generationId, user.email);
      toast.success("Project deleted successfully!");
      fetchProjects();
      if (selectedProject?.generation_id === generationId) {
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.detail || "Failed to delete project");
    }
  };

  const formatDate = (dateString) => {
    // Converts date string into a readable format.
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getLanguageIcon = (language) => {
    // Adds a small emoji for code language.
    const icons = {
      python: "🐍",
      java: "☕",
      csharp: "#️⃣",
      cpp: "⚡"
    };
    return icons[language] || "💻";
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container projects-layout">
      <div className="projects-container">
        <h1 className="projects-page-title">My OPM Projects</h1>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h2>No Projects Yet</h2>
            <p>Start by generating code from OPM diagrams!</p>
            <button
              className="cta-button"
              onClick={() => window.location.href = "/opm_code_generator"}
            >
              Generate Code
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.generation_id} className="project-card">
                <div className="project-header">
                  <div className="project-language">
                    <span className="language-icon">
                      {getLanguageIcon(project.target_language)}
                    </span>
                    <span className="language-name">
                      {project.target_language.toUpperCase()}
                    </span>
                  </div>
                  <button
                    className="delete-icon-btn"
                    onClick={() => handleDeleteProject(project.generation_id)}
                    title="Delete project"
                  >
                    🗑️
                  </button>
                </div>

                <div className="project-body">
                  <h3 className="project-title">{project.pdf_filename}</h3>
                  <p className="project-date">{formatDate(project.created_at)}</p>

                  <div className="project-info">
                    <div className="info-item">
                      <span className="info-label">Output File:</span>
                      <span className="info-value">{project.output_filename}</span>
                    </div>
                  </div>
                </div>

                <div className="project-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => handleViewProject(project)}
                  >
                    👁️ View
                  </button>
                  <button
                    className="action-btn download-btn"
                    onClick={() => handleDownloadDiagram(
                      project.generation_id,
                      project.pdf_filename
                    )}
                  >
                    📄 PDF
                  </button>
                  <button
                    className="action-btn download-btn"
                    onClick={() => handleDownloadCode(
                      project.generation_id,
                      project.output_filename
                    )}
                  >
                    💾 Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing project details */}
      {showModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProject.pdf_filename}</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>AI Explanation</h3>
                <p className="explanation-text">{selectedProject.ai_explanation}</p>
              </div>

              <div className="modal-section">
                <h3>Generated Code</h3>
                <pre className="code-preview">
                  <code>{selectedProject.ai_generated_code}</code>
                </pre>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn download-pdf-btn"
                onClick={() => handleDownloadDiagram(
                  selectedProject.generation_id,
                  selectedProject.pdf_filename
                )}
              >
                📄 Download PDF
              </button>
              <button
                className="modal-btn download-code-btn"
                onClick={() => handleDownloadCode(
                  selectedProject.generation_id,
                  selectedProject.output_filename
                )}
              >
                💾 Download Code
              </button>
              <button
                className="modal-btn delete-btn"
                onClick={() => handleDeleteProject(selectedProject.generation_id)}
              >
                🗑️ Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProjectsPage;