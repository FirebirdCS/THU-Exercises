import * as React from "react";

export function UserPage() {
  return (
    <div className="page" id="users-list">
      <header>
        <h2>Users</h2>
        <div className="user-search">
          <span className="material-icons-round">search</span>
          <input
            type="text"
            placeholder="Search an user..."
            style={{ width: 300 }}
          />
          <button className="user-button">
            <span className="material-icons-round">add</span>New user
          </button>
        </div>
      </header>
      <dialog id="new-user-modal">
        <form>
          <h2>Create an user</h2>
          <div className="input-list">
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">badge</span>Full name
              </label>
              <input type="text" placeholder="Type your full name..." />
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">mail</span>Email
              </label>
              <input type="email" placeholder="Type your email..." />
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">password</span>Password
              </label>
              <input type="password" placeholder="Type your password" />
              <p
                style={{ color: "#5d616f", fontStyle: "italic", marginTop: 5 }}
              >
                TIP: It should include at least one upper case letter
              </p>
              <p
                style={{ color: "#5d616f", fontStyle: "italic", marginTop: 5 }}
              >
                a number and special character
              </p>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">account_circle</span>Role
              </label>
              <select>
                <option>Architect</option>
                <option>Engineer</option>
                <option>Developer</option>
              </select>
            </div>
          </div>
          <div className="modals-buttons">
            <button className="cancel-button">Cancel</button>
            <button className="accept-button">Register</button>
          </div>
        </form>
      </dialog>
      <div id="user-info">
        <div className="user-card">
          <div className="user-content">
            <div className="user-property">
              <img src="assets/p1.png" alt="" className="profile-image" />
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Name</p>
              <p>Alvaro Flores</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Role</p>
              <p>Engineer</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Email</p>
              <p>alvaro@gmail.com</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Signed up</p>
              <p>6 months ago</p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: 10,
                padding: 10,
              }}
            >
              <span className="material-icons-round">edit</span>
            </div>
          </div>
        </div>
      </div>
      <div id="user-info">
        <div className="user-card">
          <div className="user-content">
            <div className="user-property">
              <img src="assets/p3.png" alt="" className="profile-image" />
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Name</p>
              <p>Susanna González</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Role</p>
              <p>Architect</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Email</p>
              <p>susanna@gmail.com</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Signed up</p>
              <p>1 year ago ago</p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: 10,
                padding: 10,
              }}
            >
              <span className="material-icons-round">edit</span>
            </div>
          </div>
        </div>
      </div>
      <div id="user-info">
        <div className="user-card">
          <div className="user-content">
            <div className="user-property">
              <img src="assets/p2.png" alt="" className="profile-image" />
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Name</p>
              <p>Pedro Jimenez</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Role</p>
              <p>Developer</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Email</p>
              <p>pedro@gmail.com</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Signed up</p>
              <p>3 years ago ago</p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: 10,
                padding: 10,
              }}
            >
              <span className="material-icons-round">edit</span>
            </div>
          </div>
        </div>
      </div>
      <div id="user-info">
        <div className="user-card">
          <div className="user-content">
            <div className="user-property">
              <img src="assets/p4.png" alt="" className="profile-image" />
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Name</p>
              <p>Carmelia Orozco</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Role</p>
              <p>Architect</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Email</p>
              <p>carmeliao@gmail.com</p>
            </div>
            <div className="user-property">
              <p style={{ color: "#969696" }}>Signed up</p>
              <p>3 weeks ago ago</p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                columnGap: 10,
                padding: 10,
              }}
            >
              <span className="material-icons-round">edit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
