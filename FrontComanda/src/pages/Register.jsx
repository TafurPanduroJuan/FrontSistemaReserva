import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/auth.css";
import registerImg from "../assets/img/register.jpg"
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmar: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido.";
    if (!form.email.trim()) e.email = "El email es requerido.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido.";
    if (!form.password) e.password = "La contraseña es requerida.";
    else if (form.password.length < 6)
      e.password = "Mínimo 6 caracteres.";
    if (form.password !== form.confirmar)
      e.confirmar = "Las contraseñas no coinciden.";
    return e;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const result = register({
      nombre: form.nombre,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (!result.ok) {
      setErrors({ email: result.error });
      return;
    }
    navigate("/mi-cuenta");
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

      {/* CONTENEDOR SPLIT (Igual que el Login) */}
      <div className="auth-split-wrapper">
        
        {/* LADO IZQUIERDO: IMAGEN */}
        <div className="auth-image-side">
          <div className="auth-image-overlay">
            <h2>Únete a Comanda</h2>
            <p>Crea tu cuenta y empieza a gestionar tus reservas de la manera más fácil y rápida.</p>
          </div>
          <img 
            src={registerImg} 
            alt="Registro Restaurante" 
          />
        </div>

        {/* LADO DERECHO: FORMULARIO */}
        <div className="auth-form-side">
          <div className="auth-card auth-card--register">
            <div className="auth-brand">
              <div className="auth-brand-icon">🍽️</div>
              <h1 className="auth-brand-title">Comanda</h1>
              <p className="auth-brand-subtitle">Crea tu cuenta gratis</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {/* Nombre */}
              <div className="auth-field">
                <label className="auth-label">Nombre completo</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-person auth-input-icon" />
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className={`auth-input ${errors.nombre ? "is-invalid" : ""}`}
                    placeholder="Tu nombre"
                  />
                </div>
                {errors.nombre && <span className="auth-field-error">{errors.nombre}</span>}
              </div>

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
                    className={`auth-input ${errors.email ? "is-invalid" : ""}`}
                    placeholder="tu@correo.com"
                  />
                </div>
                {errors.email && <span className="auth-field-error">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-label">Contraseña</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-lock auth-input-icon" />
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`auth-input ${errors.password ? "is-invalid" : ""}`}
                    placeholder="••••••••"
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
                {errors.password && <span className="auth-field-error">{errors.password}</span>}
                
                {form.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="strength-segment"
                          style={{
                            background: i <= strengthScore ? strengthColor[strengthScore] : "#e0e0e0",
                          }}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: strengthColor[strengthScore] }}>
                      {strengthLabel[strengthScore]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmar */}
              <div className="auth-field">
                <label className="auth-label">Confirmar contraseña</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-lock-fill auth-input-icon" />
                  <input
                    type={showPass ? "text" : "password"}
                    name="confirmar"
                    value={form.confirmar}
                    onChange={handleChange}
                    className={`auth-input ${errors.confirmar ? "is-invalid" : ""}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmar && <span className="auth-field-error">{errors.confirmar}</span>}
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus-fill me-2" />
                    Crear cuenta
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-link">
              ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}