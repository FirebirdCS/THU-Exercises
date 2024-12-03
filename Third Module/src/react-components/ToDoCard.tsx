import * as React from "react";

export function ToDoCard() {
  return (
    <>
      <div style={{ backgroundColor: "#2b69b5" }} className="task-item">
        {/* Background color above for the status of the task */}
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
              grade
              {/* Symbol */}
            </span>
            {/* Description of the task  */}
            <p className="description" style={{ wordWrap: "break-word" }}>
              Important Task
            </p>
          </div>
          {/* Formatted date */}
          <p style={{ textWrap: "nowrap", marginLeft: 10 }}>03/12/2024</p>
          <span
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
