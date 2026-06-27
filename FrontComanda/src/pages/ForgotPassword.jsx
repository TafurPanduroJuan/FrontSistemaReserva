import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/auth.css";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setError("Ingresa un correo electrónico."); return; }
    setLoading(true);
    setError("");
    const result = await forgotPassword(email.trim());
    setLoading(false);
    if (!result.ok) { setError(result.error || "Error al enviar el correo."); return; }
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
          <div className="auth-brand-icon">🔑</div>
          <h1 className="auth-brand-title">Comanda</h1>
          <p className="auth-brand-subtitle">Recuperar contraseña</p>
        </div>

        {!sent ? (
          <>
            <p className="auth-help-text">
              Ingresa tu correo de la cuenta Comanda <strong>o</strong> el correo de Google
              que vinculaste a tu perfil. Te enviaremos un enlace para crear una nueva contraseña.
            </p>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-field">
                <label className="auth-label">Correo electrónico</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-envelope auth-input-icon" />
                  <input
                    type="email"
                    className={`auth-input ${error ? "is-invalid" : ""}`}
                    placeholder="tu@correo.com o tu@gmail.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                  />
                </div>
                {error && (
                  <div className="auth-error">
                    <i className="bi bi-exclamation-circle-fill" /> {error}
                  </div>
                )}
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Enviando...</>
                ) : (
                  <><i className="bi bi-send me-2" />Enviar enlace de recuperación</>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-success-box">
            <i className="bi bi-check-circle-fill" style={{ fontSize: "2rem", color: "#4caf50" }} />
            <p style={{ marginTop: 12 }}>
              Si el correo <strong>{email}</strong> está registrado, recibirás
              un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
            <p style={{ fontSize: "0.85rem", color: "#666", marginTop: 8 }}>
              Revisa también tu carpeta de spam.
            </p>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-link">
            <i className="bi bi-arrow-left me-1" /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
