import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import './Register.css';

export default function Register() {
  const { register } = useAuthContext();
  const navigate     = useNavigate();

  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                   e.name     = 'El nombre es obligatorio.';
    else if (form.name.trim().length < 2)    e.name     = 'Mínimo 2 caracteres.';
    if (!form.email.trim())                  e.email    = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido.';
    if (!form.password)                      e.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 6)       e.password = 'Mínimo 6 caracteres.';
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) e.password = 'Incluye letra y número.';
    if (!form.confirm)                       e.confirm  = 'Confirma tu contraseña.';
    else if (form.confirm !== form.password) e.confirm  = 'Las contraseñas no coinciden.';
    return e;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const result = register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
    setLoading(false);
    if (!result.success) { setApiError(result.message); return; }
    navigate('/', { replace: true });
  };

  const getStrength = () => {
    const p = form.password; if (!p) return 0;
    let s = 0;
    if (p.length >= 6)           s++;
    if (p.length >= 10)          s++;
    if (/[A-Z]/.test(p))         s++;
    if (/\d/.test(p))            s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  };

  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const strengthColors = ['', '#d94040', '#d4a04a', '#6ab187', '#3a9e6a'];
  const strength = getStrength();

  const EyeOpen = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
  const EyeOff = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__overlay" /><div className="auth-bg__gradient" />
      </div>
      <div className="auth-card auth-card--register">
        <div className="auth-card__brand">
          <div className="auth-card__logo">🍽️</div>
          <span className="auth-card__brand-name">Comanda</span>
        </div>
        <h1 className="auth-card__title">Crear cuenta</h1>
        <p className="auth-card__subtitle">Únete y gestiona tus reservas</p>

        <div className="auth-register-note">
          <span className="auth-register-note__icon">ℹ️</span>
          <p className="auth-register-note__text">
            El registro es exclusivo para <strong>clientes</strong>.
            El personal y administradores son añadidos internamente.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className={`auth-field ${errors.name ? 'auth-field--error' : ''}`}>
            <label className="auth-field__label" htmlFor="name">Nombre completo</label>
            <div className="auth-field__input-wrap">
              <span className="auth-field__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </span>
              <input id="name" name="name" type="text" placeholder="Juan Pérez"
                autoComplete="name" value={form.name} onChange={handleChange}
                className="auth-field__input" />
            </div>
            {errors.name && <span className="auth-field__error">{errors.name}</span>}
          </div>

          <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
            <label className="auth-field__label" htmlFor="email">Correo electrónico</label>
            <div className="auth-field__input-wrap">
              <span className="auth-field__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/>
                </svg>
              </span>
              <input id="email" name="email" type="email" placeholder="tu@correo.com"
                autoComplete="email" value={form.email} onChange={handleChange}
                className="auth-field__input" />
            </div>
            {errors.email && <span className="auth-field__error">{errors.email}</span>}
          </div>

          <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
            <label className="auth-field__label" htmlFor="password">Contraseña</label>
            <div className="auth-field__input-wrap">
              <span className="auth-field__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input id="password" name="password" type={showPass ? 'text' : 'password'}
                placeholder="••••••••" autoComplete="new-password"
                value={form.password} onChange={handleChange} className="auth-field__input" />
              <button type="button" className="auth-field__eye" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
            {form.password && (
              <div className="auth-strength">
                <div className="auth-strength__bars">
                  {[1,2,3,4].map(i => (
                    <span key={i} className="auth-strength__bar"
                      style={{ background: i <= strength ? strengthColors[strength] : undefined }} />
                  ))}
                </div>
                <span className="auth-strength__label" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
            {errors.password && <span className="auth-field__error">{errors.password}</span>}
          </div>

          <div className={`auth-field ${errors.confirm ? 'auth-field--error' : ''}`}>
            <label className="auth-field__label" htmlFor="confirm">Confirmar contraseña</label>
            <div className="auth-field__input-wrap">
              <span className="auth-field__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m9 12 2 2 4-4"/><rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input id="confirm" name="confirm" type={showConf ? 'text' : 'password'}
                placeholder="••••••••" autoComplete="new-password"
                value={form.confirm} onChange={handleChange} className="auth-field__input" />
              <button type="button" className="auth-field__eye" onClick={() => setShowConf(v => !v)}>
                {showConf ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
            {errors.confirm && <span className="auth-field__error">{errors.confirm}</span>}
          </div>

          {apiError && (
            <div className="auth-alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}

          <button className={`auth-btn ${loading ? 'auth-btn--loading' : ''}`}
            type="submit" disabled={loading}>
            {loading ? <span className="auth-btn__spinner" /> : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿Ya tienes cuenta?{' '}
          <Link className="auth-card__link" to="/login">Inicia sesión</Link>
        </p>
        <div className="auth-card__divider"><span>Comanda © 2025</span></div>
      </div>
    </div>
  );
}