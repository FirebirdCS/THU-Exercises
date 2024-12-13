import * as React from "react";
import { ModalManager } from "@utils/Utils";
import { ToDoCard } from "@reactComponents/todo/ToDoCard";
import { ITodo, statusTask, ToDo } from "@classes/ToDo";
import { ProjectsManager } from "@classes/ProjectsManager";
import { getCollection } from "@db/index";
import * as Firestore from "firebase/firestore";
import { Project } from "@classes/Project";

interface Props {
  projectsManager: ProjectsManager;
  projectId: string;
  project: Project;
}

export function ToDoPage(props: Props) {
  const [toDos, setToDos] = React.useState<ToDo[]>([]);

  // I have to look for a way to add the todoList collection inside the projects (todolist: Map)
  const todoCollection = getCollection<ITodo>(
    `/projects/${props.projectId}/todoList`
  );
  React.useEffect(() => {
    const currentProject = props.projectsManager.list.find(
      (project) => project.id === props.projectId
    );
    if (currentProject) {
      setToDos([...currentProject.todoList]);
    }
  }, [props.projectId, props.projectsManager.list]);

  const updateToDo = (updatedToDo: ToDo) => {
    setToDos((prevToDos) =>
      prevToDos.map((todo) =>
        todo.id === updatedToDo.id ? { ...updatedToDo } : todo
      )
    );
  };

  const toDoCards = toDos.map((todo) => (
    <ToDoCard
      projectsManager={props.projectsManager}
      todo={todo}
      project={props.project}
      key={todo.id}
      onUpdate={updateToDo}
    />
  ));

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

  const onFormSubmit = async (event: React.FormEvent) => {
    const toDoForm = document.getElementById(
      "create-todo-form"
    ) as HTMLFormElement;
    const createToDoError = document.getElementById(
      "createDescriptionError"
    ) as HTMLElement;
    if (toDoForm && toDoForm instanceof HTMLFormElement) {
      const formData = new FormData(toDoForm);
      event.preventDefault();
      const todoData: ITodo = {
        description: formData.get("description") as string,
        date: new Date(
          (formData.get("date") as string).replace(/-/g, "/") || new Date() // Parsing date
        ),
        statusToDo: formData.get("statusToDo") as statusTask,
      };
      try {
        const doc = await Firestore.addDoc(todoCollection, todoData);
        const todo = props.projectsManager.newTodo(todoData, props.projectId);
        const currentProject = props.projectsManager.list.find(
          (project) => project.id === props.projectId
        );
        if (currentProject) {
          setToDos([...currentProject.todoList]);
        }
        toDoForm.reset();
        const toDoBtn = new ModalManager();
        toDoBtn.showModal("create-todo-modal", 0);
      } catch (e) {
        if (e.message.includes("description")) {
          createToDoError.innerHTML = `${e}`;
          createToDoError.style.display = "grid";
        }
      }
    }
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
      <div id="task-container" className="task-container">
        {toDoCards}
      </div>
      <dialog id="create-todo-modal">
        <form onSubmit={(e) => onFormSubmit(e)} id="create-todo-form">
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
