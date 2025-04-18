import * as React from "react";
import { ModalManager } from "@utils/Utils";
import { ToDoCard } from "@reactComponents/todo/ToDoCard";
import { ITodo, statusTask, ToDo } from "@classes/ToDo";
import { ProjectsManager } from "@classes/ProjectsManager";
import { getCollection } from "@db/index";
import * as Firestore from "firebase/firestore";
import { Project } from "@classes/Project";
import { SearchBox } from "@reactComponents/ui/SearchBox";
import { ToDoForm } from "@reactComponents/todo/ToDoForm";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const deleteToDoFromState = (id: string) => {
    setToDos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const toDoCards = toDos.map((todo) => {
    return (
      <ToDoCard
        projectsManager={props.projectsManager}
        todo={todo}
        project={props.project}
        key={todo.id}
        onUpdate={updateToDo}
        onDelete={deleteToDoFromState}
      />
    );
  });

  const modal = new ModalManager();

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

  const handleCreateToDo = async (data: ITodo) => {
    const doc = await Firestore.addDoc(todoCollection, data);
    const todoInstance = props.projectsManager.newTodo(data, props.projectId);
    todoInstance.id = doc.id;
    const current = props.projectsManager.list.find(
      (p) => p.id === props.projectId
    );
    if (current) setToDos([...current.todoList]);
    modal.showModal("create-todo-modal", 0);
    toast.success("Todo added successfully!");
  };

  const onTodoSearch = (value: string) => {
    const todoList = props.project.todoList.filter((todo) => {
      return todo.description.toLowerCase().includes(value);
    });
    setToDos(todoList);
  };

  return (
    <>
      <div className="task-header">
        <h4>To-Do</h4>
        <div className="task-searchbar">
          <div className="task-searchbar-container">
            <SearchBox onChange={onTodoSearch} searchProp="ToDo" size="100%" />
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
        <ToDoForm
          mode="create"
          onSubmit={handleCreateToDo}
          onCancel={() => modal.showModal("create-todo-modal", 0)}
        />
      </dialog>
    </>
  );
}
