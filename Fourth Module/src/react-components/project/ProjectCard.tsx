import * as React from "react";
import { Project } from "@classes/Project";
import { appIcons } from "@icons";

interface Props {
  project: Project;
}

export function ProjectCard(props: Props) {
  const iconTitle = props.project.name.substring(0, 2).toUpperCase();
  const progressPercent = Math.round(props.project.progress * 100);
  return (
    <div className="project-card">
      <div className="card-header">
        <bim-label
          style={{
            backgroundColor: `${props.project.cardColor}`,
            padding: 10,
            borderRadius: 8,
            aspectRatio: 1,
          }}
        >
          {iconTitle}
        </bim-label>
        <div>
          <p style={{ color: "white", fontSize: "1rem" }}>{props.project.name}</p>
          <p style={{ color: "#969696", fontSize: "0.9rem" }}>
            {props.project.description}
          </p>
        </div>
      </div>
      <div className="card-content">
        <div className="card-property">
          <bim-label icon={appIcons.STATUS} style={{ color: "#969696", fontSize: "1rem"}}>
            Status
          </bim-label>
          <bim-label style={{ color: "white", fontSize: "1rem" }}>{props.project.status}</bim-label>
        </div>
        <div className="card-property">
          <bim-label icon={appIcons.ROLE} style={{ color: "#969696", fontSize: "1rem" }}>
            Role
          </bim-label>
          <bim-label style={{ color: "white", fontSize: "1rem" }}>{props.project.role}</bim-label>
        </div>
        <div className="card-property">
          <bim-label icon={appIcons.COST} style={{ color: "#969696", fontSize: "1rem" }}>
            Cost
          </bim-label>
          <bim-label style={{ color: "white", fontSize: "1rem" }}>{props.project.cost}</bim-label>
        </div>
        <div className="card-property">
          <bim-label icon={appIcons.PROGRESS} style={{ color: "#969696", fontSize: "1rem" }}>
            Estimated Progress
          </bim-label>
          <bim-label style={{ color: "white", fontSize: "1rem" }}>{progressPercent}%</bim-label>
        </div>
      </div>
    </div>
  );
}
