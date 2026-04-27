import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/auth.css";

export default function ResetPassword() {
  const { confirmResetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Si no hay token en la URL, redirige a forgot-password
  useEffect(() => {
    if (!token) navigate("/forgot-password", { replace: true });
  }, [token, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  function getStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }

  const strength = getStrength(form.password);
  const strengthLabels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const strengthColors = ["", "#e74c3c", "#f39c12", "#2ecc71", "#27ae60"];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.password || !form.confirm) {
      setError("Completa todos los campos.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = confirmResetPassword(token, form.password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
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
          <h1 className="auth-brand-title">Nueva contraseña</h1>
          <p className="auth-brand-subtitle">Elige una contraseña segura</p>
        </div>

        {done ? (
          <div className="auth-success-box">
            <div className="auth-success-icon">
              <i className="bi bi-check-circle-fill" />
            </div>
            <h3>¡Contraseña actualizada!</h3>
            <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <Link
              to="/login"
              className="auth-submit-btn d-block text-center text-decoration-none mt-3"
            >
              <i className="bi bi-box-arrow-in-right me-2" />
              Ir al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Nueva contraseña */}
            <div className="auth-field">
              <label className="auth-label">Nueva contraseña</label>
              <div className="auth-input-wrap">
                <i className="bi bi-lock auth-input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`auth-input ${error ? "is-invalid" : ""}`}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                >
                  <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>

              {/* Barra de fortaleza */}
              {form.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="strength-segment"
                        style={{
                          background: i <= strength ? strengthColors[strength] : "#e0e0e0",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="strength-label"
                    style={{ color: strengthColors[strength] }}
                  >
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="auth-field">
              <label className="auth-label">Confirmar contraseña</label>
              <div className="auth-input-wrap">
                <i className="bi bi-lock-fill auth-input-icon" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  className={`auth-input ${error ? "is-invalid" : ""}`}
                  placeholder="Repite la contraseña"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <i className="bi bi-exclamation-circle-fill" /> {error}
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check me-2" />
                  Guardar nueva contraseña
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}