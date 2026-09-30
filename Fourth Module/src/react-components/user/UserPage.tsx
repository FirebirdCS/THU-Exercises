import * as React from "react";

export function UserPage() {
  return (
    <div className="page" id="users-list">
      <header>
        <h2>Usuarios</h2>
        <div className="user-search">
          <span className="material-icons-round">search</span>
          <input
            type="text"
            placeholder="Buscar usuario..."
            style={{ width: 300 }}
          />
          <button className="user-button">
            <span className="material-icons-round">add</span>Nuevo usuario
          </button>
        </div>
      </header>
      <dialog id="new-user-modal">
        <form>
          <h2>Crear usuario</h2>
          <div className="input-list">
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">badge</span>Nombre completo
              </label>
              <input type="text" placeholder="Escribe tu nombre completo..." />
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">mail</span>Correo
              </label>
              <input type="email" placeholder="Escribe tu correo..." />
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">password</span>Contraseña
              </label>
              <input type="password" placeholder="Escribe tu contraseña" />
              <p
                style={{ color: "var(--gris-texto)", fontStyle: "italic", marginTop: 5 }}
              >
                Consejo: incluye al menos una letra mayúscula,
              </p>
              <p
                style={{ color: "var(--gris-texto)", fontStyle: "italic", marginTop: 5 }}
              >
                un número y un carácter especial.
              </p>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">account_circle</span>Rol
              </label>
              <select>
                <option>Arquitecto</option>
                <option>Ingeniero</option>
                <option>Desarrollador</option>
              </select>
            </div>
          </div>
          <div className="modals-buttons">
            <button className="cancel-button">Cancelar</button>
            <button className="accept-button">Registrar</button>
          </div>
        </form>
      </dialog>
      <div id="user-info">
        <div className="user-card">
          <div className="user-content">
            <div className="user-property">
              <img src="/assets/p1.png" alt="" className="profile-image" />
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Nombre</p>
              <p>Alvaro Flores</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Rol</p>
              <p>Ingeniero</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Correo</p>
              <p>alvaro@gmail.com</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Registro</p>
              <p>Hace 6 meses</p>
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
              <img src="/assets/p3.png" alt="" className="profile-image" />
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Nombre</p>
              <p>Susanna González</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Rol</p>
              <p>Arquitecta</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Correo</p>
              <p>susanna@gmail.com</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Registro</p>
              <p>Hace 1 año</p>
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
              <img src="/assets/p2.png" alt="" className="profile-image" />
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Nombre</p>
              <p>Pedro Jimenez</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Rol</p>
              <p>Desarrollador</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Correo</p>
              <p>pedro@gmail.com</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Registro</p>
              <p>Hace 3 años</p>
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
              <img src="/assets/p4.png" alt="" className="profile-image" />
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Nombre</p>
              <p>Carmelia Orozco</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Rol</p>
              <p>Arquitecta</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Correo</p>
              <p>carmeliao@gmail.com</p>
            </div>
            <div className="user-property">
              <p style={{ color: "var(--gris-texto)" }}>Registro</p>
              <p>Hace 3 semanas</p>
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
