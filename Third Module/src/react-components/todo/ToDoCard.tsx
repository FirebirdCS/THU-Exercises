import * as React from "react";
import { ToDo } from "../../classes/ToDo";
import { formatShortDate } from "../../utils/Utils";

interface Props {
  todo: ToDo;
}

export function ToDoCard(props: Props) {
  const parsedDate = new Date(props.todo.date);
  const formattedDate = formatShortDate(parsedDate);

  return (
    <div
      style={{ backgroundColor: props.todo.colorStatus }}
      className="task-item"
    >
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
            {props.todo.symbol}
            {/* Symbol */}
          </span>
          {/* Description of the task  */}
          <p className="description" style={{ wordWrap: "break-word" }}>
            {props.todo.description}
          </p>
        </div>
        {/* Formatted date */}
        <p style={{ textWrap: "nowrap", marginLeft: 10 }}> {formattedDate}</p>
        <span
          id="editIcon"
          className="edit-icon material-icons-round"
          style={{ marginLeft: 5 }}
        >
          edit
        </span>
      </div>
    </div>
  );
}
