import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    // Simular pequeño delay de red
    await new Promise((r) => setTimeout(r, 600));
    const result = login(form.email, form.password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const { rol } = result.user;
    if (rol === "administrador") navigate("/intranet");
    else if (rol === "personal") navigate("/intranet/mesas");
    else navigate("/mi-cuenta");
  }

  return (

    <div className="auth-page">
      <div className="auth-top-right">
        <Link to="/" className="auth-home-btn">
          <i className="bi bi-house-door" /> Volver
        </Link>
      </div>
      {/* Fondo decorativo */}
      <div className="auth-bg">
        <div className="auth-bg-blob blob1" />
        <div className="auth-bg-blob blob2" />
        <div className="auth-bg-blob blob3" />
      </div>

      <div className="auth-card">
        {/* Logo / Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">🍽️</div>
          <h1 className="auth-brand-title">Comanda</h1>
          <p className="auth-brand-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        {/* Credenciales de prueba */}
        <div className="auth-demo-pills">
          <button
            type="button"
            className="demo-pill"
            onClick={() =>
              setForm({ email: "admin@comanda.com", password: "admin123" })
            }
          >
            <i className="bi bi-shield-check" /> Admin
          </button>
          <button
            type="button"
            className="demo-pill"
            onClick={() =>
              setForm({
                email: "personal@labellaitalia.com",
                password: "personal123",
              })
            }
          >
            <i className="bi bi-person-badge" /> Personal
          </button>
          <button
            type="button"
            className="demo-pill"
            onClick={() =>
              setForm({ email: "usuario@gmail.com", password: "usuario123" })
            }
          >
            <i className="bi bi-person" /> Usuario
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label">Correo electrónico</label>
            <div className="auth-input-wrap">
              <i className="bi bi-envelope auth-input-icon" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`auth-input ${error ? "is-invalid" : ""}`}
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label">Contraseña</label>
              <Link to="/forgot-password" className="auth-forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="auth-input-wrap">
              <i className="bi bi-lock auth-input-icon" />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`auth-input ${error ? "is-invalid" : ""}`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <i className="bi bi-exclamation-circle-fill" /> {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Ingresando...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2" />
                Iniciar sesión
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-link">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="auth-link">
            Regístrate gratis
          </Link>
        </div>
      </div>
    </div>
  );
}