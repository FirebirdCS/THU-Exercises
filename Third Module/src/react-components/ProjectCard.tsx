import * as React from "react";

export function ProjectCard() {
  return (
    <div className="project-card">
      <div className="card-header">
        <p
          style={{
            backgroundColor: "#565626",
            padding: 10,
            borderRadius: 8,
            aspectRatio: 1,
          }}
        >
          HC
        </p>
        <div>
          <h5>Project Name</h5>
          <p>Project Description</p>
        </div>
      </div>
      <div className="card-content">
        <div className="card-property">
          <p style={{ color: "#969696" }}>Status</p>
          <p>Active</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Role</p>
          <p>Architecture</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Cost</p>
          <p>$1,000,000.00</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Estimated Progress</p>
          <p>67%</p>
        </div>
      </div>
    </div>
  );
}
