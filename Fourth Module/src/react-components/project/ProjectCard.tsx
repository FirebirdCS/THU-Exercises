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
            color: "var(--blanco)",
          }}
        >
          {iconTitle}
        </bim-label>
        <div>
          <p style={{ color: "var(--azul)", fontSize: "1rem", fontWeight: 600 }}>
            {props.project.name}
          </p>
          <p style={{ color: "var(--gris-texto)", fontSize: "0.9rem" }}>
            {props.project.description}
          </p>
        </div>
      </div>
      <div className="card-content">
        <div className="card-property">
          <bim-label
            icon={appIcons.STATUS}
            style={{ color: "var(--gris-texto)", fontSize: "1rem" }}
          >
            Estado
          </bim-label>
          <bim-label style={{ color: "var(--azul)", fontSize: "1rem" }}>
            {props.project.status}
          </bim-label>
        </div>
        <div className="card-property">
          <bim-label
            icon={appIcons.ROLE}
            style={{ color: "var(--gris-texto)", fontSize: "1rem" }}
          >
            Rol
          </bim-label>
          <bim-label style={{ color: "var(--azul)", fontSize: "1rem" }}>
            {props.project.role}
          </bim-label>
        </div>
        <div className="card-property">
          <bim-label
            icon={appIcons.COST}
            style={{ color: "var(--gris-texto)", fontSize: "1rem" }}
          >
            Costo
          </bim-label>
          <bim-label style={{ color: "var(--azul)", fontSize: "1rem" }}>
            {props.project.cost}
          </bim-label>
        </div>
        <div className="card-property">
          <bim-label
            icon={appIcons.PROGRESS}
            style={{ color: "var(--gris-texto)", fontSize: "1rem" }}
          >
            Progreso estimado
          </bim-label>
          <bim-label style={{ color: "var(--azul)", fontSize: "1rem" }}>
            {progressPercent}%
          </bim-label>
        </div>
      </div>
    </div>
  );
}
