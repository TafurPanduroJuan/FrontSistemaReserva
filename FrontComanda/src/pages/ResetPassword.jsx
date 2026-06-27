import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/auth.css";

export default function ResetPassword() {
  const { resetPassword }         = useAuth();
  const [searchParams]            = useSearchParams();
  const navigate                  = useNavigate();
  const token                     = searchParams.get("token") || "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [done, setDone]           = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres."); return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden."); return;
    }
    if (!token) {
      setError("Token inválido. Solicita un nuevo enlace de recuperación."); return;
    }
    setLoading(true);
    setError("");
    const result = await resetPassword(token, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error || "Error al restablecer la contraseña.");
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/login"), 3000);
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
          <div className="auth-brand-icon">🔓</div>
          <h1 className="auth-brand-title">Comanda</h1>
          <p className="auth-brand-subtitle">Nueva contraseña</p>
        </div>

        {!done ? (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label className="auth-label">Nueva contraseña</label>
              <div className="auth-input-wrap">
                <i className="bi bi-lock auth-input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  className={`auth-input ${error ? "is-invalid" : ""}`}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                />
                <button type="button" className="auth-eye-btn"
                  onClick={() => setShowPass(!showPass)}>
                  <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirmar contraseña</label>
              <div className="auth-input-wrap">
                <i className="bi bi-lock-fill auth-input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  className={`auth-input ${error ? "is-invalid" : ""}`}
                  placeholder="Repite la contraseña"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(""); }}
                />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <i className="bi bi-exclamation-circle-fill" /> {error}
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
              ) : (
                <><i className="bi bi-check-lg me-2" />Guardar nueva contraseña</>
              )}
            </button>
          </form>
        ) : (
          <div className="auth-success-box">
            <i className="bi bi-check-circle-fill" style={{ fontSize: "2rem", color: "#4caf50" }} />
            <p style={{ marginTop: 12 }}>
              ¡Contraseña actualizada correctamente! Redirigiendo al inicio de sesión…
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
