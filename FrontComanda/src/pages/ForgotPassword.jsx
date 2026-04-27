import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/auth.css";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState(""); // solo para entorno de prueba

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      setError("Ingresa tu email.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const result = resetPassword(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDevToken(result.token); // guardamos el token para mostrarlo en dev
    setSent(true);
  }

  return (
    <div className="auth-page">
      <div className="auth-top-right">
        <Link to="/" className="auth-home-btn">
          <i className="bi bi-house-door" /> Volver
        </Link>
      </div>
      <div className="auth-bg">
        <div className="auth-bg-blob blob1" />
        <div className="auth-bg-blob blob2" />
        <div className="auth-bg-blob blob3" />
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">🔐</div>
          <h1 className="auth-brand-title">Recuperar acceso</h1>
          <p className="auth-brand-subtitle">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {sent ? (
          <div className="auth-success-box">
            <div className="auth-success-icon">
              <i className="bi bi-envelope-check-fill" />
            </div>
            <h3>¡Correo enviado!</h3>
            <p>
              Revisá tu bandeja de entrada en <strong>{email}</strong> y sigue
              las instrucciones para recuperar tu contraseña.
            </p>

            {/* ── Bloque solo para desarrollo/pruebas ── */}
            {devToken && (
              <div className="auth-dev-hint">
                <p>
                  <i className="bi bi-code-slash me-1" />
                  <strong>[DEV]</strong> Enlace simulado:
                </p>
                <Link
                  to={`/reset-password?token=${devToken}`}
                  className="auth-dev-link"
                >
                  /reset-password?token={devToken.substring(0, 12)}…
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="auth-submit-btn d-block text-center text-decoration-none mt-3"
            >
              <i className="bi bi-arrow-left me-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label className="auth-label">Correo electrónico</label>
              <div className="auth-input-wrap">
                <i className="bi bi-envelope auth-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={`auth-input ${error ? "is-invalid" : ""}`}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                />
              </div>
              {error && <span className="auth-field-error">{error}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2" />
                  Enviar enlace de recuperación
                </>
              )}
            </button>
          </form>
        )}

        {!sent && (
          <div className="auth-footer-link">
            <Link to="/login" className="auth-link">
              <i className="bi bi-arrow-left me-1" />
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}