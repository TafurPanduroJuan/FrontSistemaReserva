import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/auth.css";
import registerImg from "../assets/img/register.jpg";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate  = useNavigate();
  const googleBtn = useRef(null);

  const [form, setForm] = useState({
    nombre: "", email: "", password: "", confirmar: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  handleGoogleCallback,
    });
    window.google.accounts.id.renderButton(googleBtn.current, {
      theme:  "outline",
      size:   "large",
      text:   "signup_with",
      width:  "100%",
      locale: "es",
    });
  }, []);

  async function handleGoogleCallback(response) {
    setLoading(true);
    const result = await loginWithGoogle(response.credential);
    setLoading(false);
    if (!result.ok) { setErrors({ email: result.error }); return; }
    navigate("/my-account");
  }

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido.";
    if (!form.email.trim()) e.email = "El email es requerido.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido.";
    if (!form.password) e.password = "La contraseña es requerida.";
    else if (form.password.length < 6) e.password = "Mínimo 6 caracteres.";
    if (form.password !== form.confirmar) e.confirmar = "Las contraseñas no coinciden.";
    return e;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setLoading(true);
    const result = await register({
      nombre: form.nombre,
      email:  form.email,
      password: form.password,
    });
    setLoading(false);
    if (!result.ok) { setErrors({ email: result.error }); return; }
    navigate("/my-account");
  }

  const strengthScore = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Muy débil", "Débil", "Regular", "Buena", "Fuerte"];
  const strengthColor = ["", "#ff3300", "#ff6b00", "#ff9f22", "#8bc34a", "#4caf50"];

  return (
    <div className="auth-page">
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
        <div className="auth-image-side">
          <div className="auth-image-overlay">
            <h2>Únete a Comanda</h2>
            <p>Crea tu cuenta y empieza a gestionar tus reservas de la manera más fácil y rápida.</p>
          </div>
          <img src={registerImg} alt="Registro Restaurante" />
        </div>

        <div className="auth-form-side">
          <div className="auth-card auth-card--register">
            <div className="auth-brand">
              <div className="auth-brand-icon">🍽️</div>
              <h1 className="auth-brand-title">Comanda</h1>
              <p className="auth-brand-subtitle">Crea tu cuenta gratis</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-field">
                <label className="auth-label">Nombre completo</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-person auth-input-icon" />
                  <input type="text" name="nombre" value={form.nombre}
                    onChange={handleChange}
                    className={`auth-input ${errors.nombre ? "is-invalid" : ""}`}
                    placeholder="Tu nombre" />
                </div>
                {errors.nombre && <span className="auth-field-error">{errors.nombre}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label">Correo electrónico</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-envelope auth-input-icon" />
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange}
                    className={`auth-input ${errors.email ? "is-invalid" : ""}`}
                    placeholder="tu@correo.com" />
                </div>
                {errors.email && <span className="auth-field-error">{errors.email}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label">Contraseña</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-lock auth-input-icon" />
                  <input type={showPass ? "text" : "password"} name="password" value={form.password}
                    onChange={handleChange}
                    className={`auth-input ${errors.password ? "is-invalid" : ""}`}
                    placeholder="••••••••" />
                  <button type="button" className="auth-eye-btn"
                    onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                    <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
                {errors.password && <span className="auth-field-error">{errors.password}</span>}
                {form.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="strength-segment"
                          style={{ background: i <= strengthScore ? strengthColor[strengthScore] : "#e0e0e0" }} />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: strengthColor[strengthScore] }}>
                      {strengthLabel[strengthScore]}
                    </span>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label">Confirmar contraseña</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-lock-fill auth-input-icon" />
                  <input type={showPass ? "text" : "password"} name="confirmar" value={form.confirmar}
                    onChange={handleChange}
                    className={`auth-input ${errors.confirmar ? "is-invalid" : ""}`}
                    placeholder="••••••••" />
                </div>
                {errors.confirmar && <span className="auth-field-error">{errors.confirmar}</span>}
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Creando cuenta...</>
                ) : (
                  <><i className="bi bi-person-plus-fill me-2" />Crear cuenta</>
                )}
              </button>
            </form>

            <div className="auth-divider"><span>o regístrate con</span></div>

            {GOOGLE_CLIENT_ID ? (
              <div ref={googleBtn} className="auth-google-btn-wrap" />
            ) : (
              <button type="button" className="auth-google-btn"
                onClick={() => alert("Configura VITE_GOOGLE_CLIENT_ID en tu .env")}>
                <GoogleIcon />
                Registrarse con Google
              </button>
            )}

            <div className="auth-footer-link">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="auth-link">Inicia sesión</Link>
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
