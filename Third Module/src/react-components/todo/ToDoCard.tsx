import * as React from "react";
import { ToDo } from "../../classes/ToDo";

interface Props {
  todo: ToDo;
}

export function ToDoCard() {
  //   if (this.statusToDo === "important") {
  //     this.symbol = "warning";
  //     this.colorStatus = "#cf0e28";
  //   } else if (this.statusToDo === "completed") {
  //     this.symbol = "done";
  //     this.colorStatus = "#0ec70e";
  //   } else if (this.statusToDo === "on-going") {
  //     this.symbol = "grade";
  //     this.colorStatus = "#2b69b5";
  //   }
  return (
    <div id="task-container" className="task-container">
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
    </div>
  );
}
