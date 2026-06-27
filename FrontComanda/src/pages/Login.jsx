import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/auth.css";
import loginImg from "../assets/img/login.jpg";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const googleBtn = useRef(null);

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // ── Inicializar Google Sign-In ───────────────────────────────────────────
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  handleGoogleCallback,
    });
    window.google.accounts.id.renderButton(googleBtn.current, {
      theme: "outline",
      size:  "large",
      text:  "signin_with",
      width: "100%",
      locale: "es",
    });
  }, []);

  async function handleGoogleCallback(response) {
    setLoading(true);
    setError("");
    const result = await loginWithGoogle(response.credential);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    redirectAfterLogin(result.user.rol);
  }

  function redirectAfterLogin(rol) {
    const from = location.state?.from;
    if (from)               navigate(from);
    else if (rol === "administrador") navigate("/intranet");
    else if (rol === "personal")      navigate("/intranet/tables");
    else                              navigate("/my-account");
  }

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
    const result = await login(form.email, form.password);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    redirectAfterLogin(result.user.rol);
  }

  return (
    <div className="auth-page">
      {/* Script de Google (carga dinámica) */}
      {GOOGLE_CLIENT_ID && (
        <script src="https://accounts.google.com/gsi/client" async defer />
      )}

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

      <div className="auth-split-wrapper">
        {/* LADO IZQUIERDO */}
        <div className="auth-image-side">
          <div className="auth-image-overlay">
            <h2>Bienvenido a Comanda</h2>
            <p>Gestiona tus reservas y disfruta de la mejor experiencia gastronómica.</p>
          </div>
          <img src={loginImg} alt="Restaurant Interior" />
        </div>

        {/* LADO DERECHO */}
        <div className="auth-form-side">
          <div className="auth-card">
            <div className="auth-brand">
              <div className="auth-brand-icon">🍽️</div>
              <h1 className="auth-brand-title">Comanda</h1>
              <p className="auth-brand-subtitle">Inicia sesión en tu cuenta</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
                  />
                </div>
              </div>

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
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPass(!showPass)}
                  >
                    <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-error">
                  <i className="bi bi-exclamation-circle-fill" /> {error}
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </button>
            </form>

            {/* ── Divisor ── */}
            <div className="auth-divider">
              <span>o continúa con</span>
            </div>

            {/* ── Botón Google ── */}
            {GOOGLE_CLIENT_ID ? (
              <div ref={googleBtn} className="auth-google-btn-wrap" />
            ) : (
              <button
                type="button"
                className="auth-google-btn"
                onClick={() => alert("Configura VITE_GOOGLE_CLIENT_ID en tu .env")}
              >
                <GoogleIcon />
                Continuar con Google
              </button>
            )}

            <div className="auth-footer-link">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="auth-link">Regístrate gratis</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
