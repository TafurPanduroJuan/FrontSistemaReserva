import { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/styles/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
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
          <h1 className="auth-brand-name">Comanda</h1>
          <p className="auth-brand-sub">Recuperar cuenta</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Correo electrónico</label>
              <div className="auth-input-wrap">
                <i className="bi bi-envelope auth-input-icon" />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="auth-submit-btn">
              Enviar solicitud
            </button>
          </form>
        ) : (
          <div className="auth-success-box">
            <i className="bi bi-check-circle me-2" />
            <p>
              Tu solicitud fue registrada. Un <strong>administrador</strong> revisará
              tu cuenta y te asignará una contraseña temporal a la brevedad.
            </p>
            <p style={{ fontSize: "0.85rem", color: "#666", marginTop: 8 }}>
              Si tienes urgencia, contacta directamente al administrador del sistema.
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