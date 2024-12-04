import * as React from "react";
import { ModalManager } from "../../utils/Utils";
import { ToDoCard } from "./ToDoCard";

export function ToDoPage() {
  const onNewToDoClick = () => {
    const error = document.getElementById(
      "createDescriptionError"
    ) as HTMLElement;
    if (error) {
      error.style.display = "none";
    }
    const createToDoModal = new ModalManager();
    createToDoModal.showModal("create-todo-modal", 1);
  };

  const onCloseModal = () => {
    const toDoForm = document.getElementById(
      "create-todo-form"
    ) as HTMLFormElement;
    toDoForm.reset();
    const closeToDoModal = new ModalManager();
    closeToDoModal.showModal("create-todo-modal", 0);
  };

  return (
    <>
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
            onClick={onNewToDoClick}
            style={{ cursor: "pointer" }}
            className="material-icons-round"
          >
            add
          </span>
        </div>
      </div>
      <ToDoCard />
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
              onClick={onCloseModal}
            >
              Cancel
            </button>
            <button type="submit" className="update-button">
              Create
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
