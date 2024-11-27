import * as React from "react";

export function ProjectsPage() {
  return (
    <div className="page" id="projects-page">
      <dialog id="new-project-modal">
        <form id="new-project-form">
          <h2>New project</h2>
          <div className="input-list">
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">apartment</span>Name
              </label>
              <input name="name" type="text" />
              <p
                id="tip"
                style={{ color: "#5d616f", fontStyle: "italic", marginTop: 5 }}
              >
                TIP: Give it a short name
              </p>
              <p
                id="nameError"
                style={{ color: "red", marginTop: 5, display: "none" }}
              />
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">notes</span>Description
              </label>
              <textarea
                name="description"
                cols={30}
                rows={5}
                placeholder="Give your description"
                defaultValue={""}
              />
              <p
                id="nameError2"
                style={{ color: "red", marginTop: 5, display: "none" }}
              />
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">account_circle</span>Role
              </label>
              <select name="role">
                <option>Architect</option>
                <option>Engineer</option>
                <option>Developer</option>
              </select>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">help</span>Status
              </label>
              <select name="status">
                <option>Pending</option>
                <option>Active</option>
                <option>Finished</option>
              </select>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">calendar_month</span>
                Finish date
              </label>
              <input name="date" type="date" />
            </div>
          </div>
          <div className="modals-buttons">
            <button
              id="close-modal"
              type="button"
              value="cancel"
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" className="accept-button">
              Accept
            </button>
          </div>
        </form>
      </dialog>
      <header>
        <h2>Project List</h2>
        <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
          <span
            id="import-projects-btn"
            style={{ cursor: "pointer" }}
            className="material-icons-round action-icon"
          >
            file_upload
          </span>
          <span
            id="export-projects-btn"
            style={{ cursor: "pointer" }}
            className="material-icons-round action-icon"
          >
            file_download
          </span>
          <button id="new-project-btn" className="project-button">
            <span className="material-icons-round">add</span>New project
          </button>
        </div>
      </header>
      <div id="projects-lists"></div>
    </div>
  );
}
