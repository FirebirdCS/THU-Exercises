import * as React from "react";

export function ProjectDetailsPage() {
  return (
    <div className="page" id="project-details">
      <dialog id="update-project-modal">
        <form id="update-project-form">
          <h2>Edit project</h2>
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
                id="updateNameError"
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
                id="updateNameError2"
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
              id="close-edit-modal"
              type="button"
              value="cancel"
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" className="update-button">
              Update
            </button>
          </div>
        </form>
      </dialog>
      <header>
        <div>
          <h2 data-project-info="name">Hospital Center</h2>
          <p data-project-info="description" style={{ color: "#969696" }}>
            Community hospital center located at Downtown{" "}
          </p>
        </div>
      </header>
      <div className="main-page-content">
        <div className="details-column">
          <div className="dashboard-card" style={{ padding: "30px 0" }}>
            <div className="details-header">
              <p
                data-project-info="icon"
                style={{
                  fontSize: 20,
                  backgroundColor: "#ca8134",
                  aspectRatio: 1,
                  borderRadius: "100%",
                  padding: 12,
                }}
              >
                HC
              </p>
              <button id="edit-btn" className="edit-button">
                <p style={{ width: "100%" }}>Edit</p>
              </button>
            </div>
            <div style={{ padding: "0 30px" }}>
              <div>
                <h5 data-project-info="name">Hospital Center</h5>
                <p data-project-info="description">
                  Community hospital located at downtown
                </p>
              </div>
              <div className="details-info">
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Status
                  </p>
                  <p data-project-info="status">Active</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Cost
                  </p>
                  <p data-project-info="cost">$2,500.000</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Role
                  </p>
                  <p data-project-info="role">Engineer</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Finish Date
                  </p>
                  <p data-project-info="date">2023-11-27</p>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#404040",
                  borderRadius: 9999,
                  overflow: "auto",
                }}
              >
                <div
                  data-project-info="progress"
                  style={{
                    width: "80%",
                    backgroundColor: "green",
                    padding: "4px 0",
                    textAlign: "center",
                  }}
                >
                  80%
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-card" style={{ flexGrow: "1" }}>
            <div className="task-header">
              <h4>To-Do</h4>
              <div className="task-searchbar">
                <div className="task-searchbar-container">
                  <span className="material-icons-round">search</span>
                  <input
                    type="text"
                    placeholder="Search To-Do's by name"
                    style={{ width: "100%" }}
                  />
                </div>
                <span
                  id="create-toDo"
                  style={{ cursor: "pointer" }}
                  className="material-icons-round"
                >
                  add
                </span>
              </div>
            </div>
            <div id="task-container" className="task-container">
              {" "}
            </div>
          </div>
          <dialog id="create-todo-modal">
            <form id="create-todo-form">
              <h2>Create a toDo</h2>
              <div className="input-list">
                <div className="form-field-container">
                  <label>
                    <span className="material-icons-round">notes</span>
                    Description
                  </label>
                  <textarea
                    name="description"
                    cols={30}
                    rows={5}
                    placeholder="Give the description of the task"
                    defaultValue={""}
                  />
                  <p
                    id="createDescriptionError"
                    style={{ color: "red", marginTop: 5, display: "none" }}
                  />
                </div>
                <div className="form-field-container">
                  <label>
                    <span className="material-icons-round">calendar_month</span>
                    Finish date
                  </label>
                  <input name="date" type="date" />
                </div>
                <div className="form-field-container">
                  <label>
                    <span className="material-icons-round">help</span>Status
                  </label>
                  <select name="statusToDo">
                    <option>important</option>
                    <option>completed</option>
                    <option>on-going</option>
                  </select>
                </div>
              </div>
              <div className="modals-buttons">
                <button
                  id="close-todo-modal"
                  type="button"
                  value="cancel"
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="update-button">
                  Create
                </button>
              </div>
            </form>
          </dialog>
          <dialog id="edit-todo-modal">
            <form id="edit-todo-form">
              <h2>Edit a toDo</h2>
              <div className="input-list">
                <input
                  readOnly
                  name="idToDo"
                  type="text"
                  style={{ display: "none" }}
                />
                <div className="form-field-container">
                  <label>
                    <span className="material-icons-round">notes</span>
                    Description
                  </label>
                  <textarea
                    name="description"
                    cols={30}
                    rows={5}
                    placeholder="Give the description of the task"
                    defaultValue={""}
                  />
                  <p
                    id="updateDescriptionError"
                    style={{ color: "red", marginTop: 5, display: "none" }}
                  />
                </div>
                <div className="form-field-container">
                  <label>
                    <span className="material-icons-round">calendar_month</span>
                    Finish date
                  </label>
                  <input name="date" type="date" />
                </div>
                <div className="form-field-container">
                  <label>
                    <span className="material-icons-round">help</span>Status
                  </label>
                  <select name="statusToDo">
                    <option>important</option>
                    <option>completed</option>
                    <option>on-going</option>
                  </select>
                </div>
              </div>
              <div className="modals-buttons">
                <button
                  id="close-editToDo-modal"
                  type="button"
                  value="cancel"
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="update-button">
                  Update
                </button>
              </div>
            </form>
          </dialog>
        </div>
        <div
          id="viewer-container"
          className="dashboard-card"
          style={{ minWidth: 0, minHeight: 0 }}
        />
      </div>
    </div>
  );
}
