import React from "react";

interface ConfirmModalProps {
  id: string;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  id,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
    onCancel();
  };

  return (
    <dialog id={id}>
      <form onSubmit={handleSubmit} className="input-list">
        <h2>{title}</h2>
        <div className="input-list">
          <p style={{ color: "#969696", margin: "20px 0" }}>{message}</p>
        </div>
        <div className="modals-buttons">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="accept-button">
            Accept
          </button>
        </div>
      </form>
    </dialog>
  );
};
