import * as React from "react";
import * as Router from "react-router-dom";
import { logIn } from "@db/index";
import { useAuth } from "./AuthContext";

/** Maps Firebase Auth error codes to friendly Spanish messages. */
function mapAuthError(code: string | undefined): string {
  switch (code) {
    case "auth/invalid-email":
      return "El correo electrónico no es válido.";
    case "auth/user-disabled":
      return "Esta cuenta ha sido deshabilitada.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Inténtalo de nuevo más tarde.";
    case "auth/network-request-failed":
      return "Error de red. Comprueba tu conexión.";
    default:
      return "No se pudo iniciar sesión. Inténtalo de nuevo.";
  }
}

export function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = Router.useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Already signed in: don't show the login screen.
  if (!loading && user) {
    return <Router.Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Introduce tu correo y contraseña.");
      return;
    }
    setSubmitting(true);
    try {
      await logIn(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(mapAuthError(err?.code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <img
          className="login-logo"
          src="/assets/BCA-LogoNegro.webp"
          alt="BCA"
        />
        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-subtitle">
          Acceso exclusivo para usuarios autorizados
        </p>

        <div className="form-field-container">
          <label>
            <span className="material-icons-round">mail</span>Correo
            electrónico
          </label>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />
        </div>

        <div className="form-field-container">
          <label>
            <span className="material-icons-round">lock</span>Contraseña
          </label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button
          type="submit"
          className="accept-button login-button"
          disabled={submitting}
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
