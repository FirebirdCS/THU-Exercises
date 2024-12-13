import * as React from "react";
import { ITodo, statusTask, ToDo } from "@classes/ToDo";
import { formattedDateToDo, ModalManager } from "@utils/Utils";
import { ProjectsManager } from "@classes/ProjectsManager";
import { updateDocument } from "@db/index";
import { Project } from "@classes/Project";

interface Props {
  todo: ToDo;
  projectsManager: ProjectsManager;
  project: Project;
  onUpdate: (updatedToDo: ToDo) => void;
}

export function ToDoCard(props: Props) {
  const [todo, setTodo] = React.useState<ITodo | null>(null);

  React.useEffect(() => {
    const currentTodo = props.projectsManager.getToDo(props.todo.id);
    if (currentTodo && currentTodo instanceof ToDo) {
      setTodo(currentTodo);
    } else {
      console.log("Todo not found", props.todo.id);
    }
  }, [props.todo, props.projectsManager]);

  const parsedDate = new Date(props.todo.date);
  const formattedDate = formattedDateToDo(parsedDate);

  const onFormSubmit = async (event: React.FormEvent) => {
    const editToDoForm = document.getElementById(
      "edit-todo-form"
    ) as HTMLFormElement;
    const updateDescriptionError = document.getElementById(
      "updateDescriptionError"
    ) as HTMLElement;
    if (editToDoForm && editToDoForm instanceof HTMLFormElement) {
      const formData = new FormData(editToDoForm);
      event.preventDefault();
      const newData: ITodo = {
        description: formData.get("description") as string,
        date: new Date((formData.get("date") as string) || new Date()),
        statusToDo: formData.get("statusToDo") as statusTask,
      };
      try {
        const todoId = formData.get("idToDo") as string;
        await updateDocument<Partial<ITodo>>(
          `/projects/${props.project.id}/todoList`,
          todoId,
          newData
        );
        props.projectsManager.updateTodo(todoId, newData);
        updateDescriptionError.style.display = "none";
        editToDoForm.reset();
        const updateToDo = new ModalManager();
        updateToDo.showModal("edit-todo-modal", 0);
        const updatedTodo = props.projectsManager.getToDo(todoId);
        if (updatedTodo) {
          setTodo(updatedTodo);
          props.onUpdate(updatedTodo);
        }
      } catch (e) {
        if (e.message.includes("description")) {
          updateDescriptionError.innerHTML = `${e}`;
          updateDescriptionError.style.display = "grid";
        }
      }
    }
  };

  const onEditToDoClick = () => {
    const editToDoModal = new ModalManager();
    editToDoModal.showModal("edit-todo-modal", 1);

    const editToDoForm = document.getElementById(
      "edit-todo-form"
    ) as HTMLFormElement;
    if (editToDoForm) {
      const { todo } = props;
      const idForm = editToDoForm.querySelector(
        `[name=idToDo]`
      ) as HTMLInputElement;
      const descriptionInput = editToDoForm.querySelector(
        "[name='description']"
      ) as HTMLTextAreaElement;
      const dateInput = editToDoForm.querySelector(
        "[name='date']"
      ) as HTMLInputElement;
      const statusSelect = editToDoForm.querySelector(
        "[name='statusToDo']"
      ) as HTMLSelectElement;

      if (idForm) idForm.value = todo.id;
      if (descriptionInput) descriptionInput.value = todo.description;
      if (dateInput) dateInput.value = formattedDateToDo(todo.date);
      if (statusSelect) statusSelect.value = todo.statusToDo;
    }
  };

  const onCloseModal = () => {
    const toDoForm = document.getElementById(
      "edit-todo-form"
    ) as HTMLFormElement;
    toDoForm.reset();
    const closeToDoModal = new ModalManager();
    closeToDoModal.showModal("edit-todo-modal", 0);
  };

  return (
    <>
      <dialog id="edit-todo-modal">
        <form onSubmit={(e) => onFormSubmit(e)} id="edit-todo-form">
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
              onClick={onCloseModal}
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
      <div
        style={{ backgroundColor: props.todo.colorStatus }}
        className="task-item"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", columnGap: 15, alignItems: "center" }}>
            <span
              className="material-icons-round"
              style={{ padding: 10, borderRadius: 10 }}
            >
              {props.todo.symbol}
            </span>
            <p className="description" style={{ wordWrap: "break-word" }}>
              {props.todo.description}
            </p>
          </div>
          <p style={{ textWrap: "nowrap", marginLeft: 10 }}> {formattedDate}</p>
          <span
            onClick={onEditToDoClick}
            id="editIcon"
            className="edit-icon material-icons-round"
            style={{ marginLeft: 5 }}
          >
            edit
          </span>
        </div>
      </div>
    </>
  );
}
