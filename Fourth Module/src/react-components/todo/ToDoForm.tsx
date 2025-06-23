import React, { useState, useEffect } from "react";
import { ITodo, statusTask } from "@classes/ToDo";
import { parseDateInput } from "@utils/Utils";

interface Props {
  initialData?: ITodo;
  mode: "create" | "edit";
  onSubmit: (data: ITodo) => Promise<void> | void;
  onCancel: () => void;
}

export const ToDoForm: React.FC<Props> = ({
  initialData,
  mode,
  onSubmit,
  onCancel,
}) => {
  const [description, setDescription] = useState<string>(
    initialData?.description || ""
  );
  const [date, setDate] = useState<string>(
    initialData ? formatDateInput(initialData.date) : ""
  );
  const [status, setStatus] = useState<statusTask>(
    initialData?.statusToDo || "important"
  );
  const [errors, setErrors] = useState<{ description?: string }>({});

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setDate(formatDateInput(initialData.date));
      setStatus(initialData.statusToDo);
      setErrors({});
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const data: ITodo = {
      description: description.trim(),
      date: date ? parseDateInput(date) : new Date(),
      statusToDo: status,
    };

    try {
      await onSubmit(data);
      clearForm();
    } catch (err: any) {
      setErrors({ description: err.message });
    }
  };

  const clearForm = () => {
    setErrors({});
    if (mode === "create") {
      setDescription("");
      setDate("");
      setStatus("important");
    } else if (initialData) {
      setDescription(initialData.description);
      setDate(formatDateInput(initialData.date));
      setStatus(initialData.statusToDo);
    }
  };

  const handleCancel = () => {
    clearForm();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="input-list">
      <h2>{mode === "create" ? "Create To-Do" : "Edit To-Do"}</h2>
      <div className="input-list">
        <div className="form-field-container">
          <label>
            <span className="material-icons-round">notes</span>Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p
            id={
              mode === "create"
                ? "createDescriptionError"
                : "updateDescriptionError"
            }
            style={{
              color: "red",
              marginTop: 5,
              display: errors.description ? "block" : "none",
            }}
          >
            {errors.description}
          </p>
        </div>

        <div className="form-field-container">
          <label>
            <span className="material-icons-round">calendar_month</span>Finish
            Date
          </label>
          <input
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-field-container">
          <label>
            <span className="material-icons-round">help</span>Status
          </label>
          <select
            name="statusToDo"
            value={status}
            onChange={(e) => setStatus(e.target.value as statusTask)}
          >
            <option value="important">important</option>
            <option value="completed">completed</option>
            <option value="on-going">on-going</option>
          </select>
        </div>
      </div>

      <div className="modals-buttons">
        <button type="button" className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className={mode === "create" ? "accept-button" : "update-button"}
        >
          {mode === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

function formatDateInput(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
