import React, { useState, useEffect } from "react";
import { IProject, projectStatus, userRole } from "@classes/Project";

interface Props {
  initialData?: IProject;
  mode: "create" | "edit";
  onSubmit: (data: IProject) => Promise<void> | void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<Props> = ({
  initialData,
  mode,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [role, setRole] = useState<userRole>(initialData?.role || "architect");
  const [status, setStatus] = useState<projectStatus>(
    initialData?.status || "pending"
  );
  const [date, setDate] = useState<string>(
    initialData ? formatDateInput(initialData.date) : ""
  );
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {}
  );

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setRole(initialData.role);
      setStatus(initialData.status);
      setDate(formatDateInput(initialData.date));
      setErrors({});
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "El nombre es obligatorio";
    else if (name.trim().length < 5)
      newErrors.name = "El nombre debe tener al menos 5 caracteres";

    if (!description.trim())
      newErrors.description = "La descripción es obligatoria";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const data: IProject = {
      name: name.trim(),
      description: description.trim(),
      role,
      status,
      date: date ? new Date(date) : new Date(),
      todoList: [],
    };

    try {
      await onSubmit(data);
      clearForm();
    } catch (err: any) {
      const msg = err.message as string;
      if (msg.includes("already exists") || msg.includes("at least")) {
        setErrors({ name: msg });
      } else if (msg.includes("description")) {
        setErrors({ description: msg });
      }
      return;
    }
  };

  const clearForm = () => {
    setErrors({});
    if (mode === "create") {
      setName("");
      setDescription("");
      setRole("architect");
      setStatus("pending");
      setDate("");
    } else if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setRole(initialData.role);
      setStatus(initialData.status);
      setDate(formatDateInput(initialData.date));
    }
  };

  const handleCancel = () => {
    clearForm();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="input-list">
      <h2>{mode === "create" ? "New project" : "Edit project"}</h2>
      <div className="input-list">
        <div className="form-field-container">
          <label>
            <span className="material-icons-round">apartment</span>Name
          </label>
          <input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p
            id="tip"
            style={{ color: "#5d616f", fontStyle: "italic", marginTop: 5 }}
          >
            TIP: Give it a short name
          </p>
          {errors.name && (
            <p
              className="error"
              style={{
                color: "red",
                marginTop: 5,
                display: errors.name ? "block" : "none",
              }}
            >
              {errors.name}
            </p>
          )}
        </div>

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
          {errors.description && (
            <p
              className="error"
              style={{
                color: "red",
                marginTop: 5,
                display: errors.description ? "block" : "none",
              }}
            >
              {errors.description}
            </p>
          )}
        </div>

        <div className="form-field-container">
          <label>
            <span className="material-icons-round">account_circle</span>Role
          </label>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as userRole)}
          >
            <option value="architect">Architect</option>
            <option value="engineer">Engineer</option>
            <option value="developer">Developer</option>
          </select>
        </div>

        <div className="form-field-container">
          <label>
            <span className="material-icons-round">help</span>Status
          </label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as projectStatus)}
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="finished">Finished</option>
          </select>
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

        <div className="modals-buttons">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={mode === "create" ? "accept-button" : "update-button"}
          >
            {mode === "create" ? "Create" : "Update"}
          </button>
        </div>
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
