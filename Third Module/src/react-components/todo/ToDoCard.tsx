import React, { useEffect } from "react";
import { ModalManager } from "@utils/Utils";
import { ITodo, ToDo } from "@classes/ToDo";
import { ProjectsManager } from "@classes/ProjectsManager";
import { Project } from "@classes/Project";
import { formattedDateToDo } from "@utils/Utils";
import { updateDocument, deleteDocument } from "@db/index";
import { ToDoForm } from "@reactComponents/todo/ToDoForm";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfirmModal } from "@utils/ConfirmModal";

interface Props {
  todo: ToDo;
  projectsManager: ProjectsManager;
  project: Project;
  onUpdate: (updatedToDo: ToDo) => void;
  onDelete: (id: string) => void;
}

export function ToDoCard(props: Props) {
  const { todo, projectsManager, project, onUpdate, onDelete } = props;
  const modal = new ModalManager();
  // Another way to reference the todo.id from the ToDoPage
  const dialogId = `edit-todo-modal-${todo.id}`;
  const confirmDialogId = `confirm-todo-delete-${todo.id}`;

  const onEditToDoClick = () => {
    modal.showModal(dialogId, 1);
    console.log(todo.id);
  };

  const handleCancel = () => {
    modal.showModal(dialogId, 0);
  };

  const handleUpdate = async (data: ITodo) => {
    await updateDocument<Partial<ITodo>>(
      `/projects/${project.id}/todoList`,
      todo.id,
      data
    );
    projectsManager.updateTodo(todo.id, data);
    const updated = projectsManager.getToDo(todo.id);
    if (updated) {
      onUpdate(updated);
    }
    handleCancel();
    toast.success("Todo updated successfully!");
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(`/projects/${project.id}/todoList`, todo.id);
    } catch (e) {
      console.log(e);
    }
    projectsManager.deleteTodo(todo.id);
    toast.success("Todo deleted successfully!");
    setTimeout(() => onDelete(todo.id), 1500);
  };

  // Format display date
  const formattedDate = formattedDateToDo(new Date(todo.date));

  const openConfirmModal = () => {
    modal.showModal(confirmDialogId, 1);
  };

  const closeConfirmModal = () => {
    modal.showModal(confirmDialogId, 0);
  };

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="dark"
      />
      <ConfirmModal
        id={confirmDialogId}
        title="Delete Todo"
        message={`Are you sure you want to delete todo called ${todo.description}?`}
        onConfirm={handleDelete}
        onCancel={closeConfirmModal}
      />
      <dialog id={dialogId}>
        <ToDoForm
          mode="edit"
          initialData={todo}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
        />
      </dialog>
      <div style={{ backgroundColor: todo.colorStatus }} className="task-item">
        <div className="description-container">
          <span
            className="material-icons-round"
            style={{ padding: 10, borderRadius: 10 }}
          >
            {todo.symbol}
          </span>
          <p className="description">{todo.description}</p>
        </div>
        <div className="action-icons">
          <p style={{ whiteSpace: "nowrap" }}>{formattedDate}</p>
          <span
            onClick={onEditToDoClick}
            className="edit-icon material-icons-round"
            style={{ cursor: "pointer" }}
          >
            edit
          </span>
          <span
            onClick={openConfirmModal}
            className="material-icons-round action-icon"
            style={{ cursor: "pointer" }}
          >
            delete
          </span>
        </div>
      </div>
    </>
  );
}
