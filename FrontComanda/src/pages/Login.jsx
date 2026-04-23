import { useState } from 'react';
import './Login.css';

export default function Login({ onLogin, onGoRegister }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) {
      e.email = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Ingresa un correo válido.';
    }
    if (!form.password) {
      e.password = 'La contraseña es obligatoria.';
    } else if (form.password.length < 6) {
      e.password = 'Mínimo 6 caracteres.';
    }
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
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const result = onLogin(form.email, form.password);
    setLoading(false);
    if (!result.success) setApiError(result.message);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__overlay" />
        <div className="auth-bg__gradient" />
      </div>

      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__brand-icon">✦</span>
          <p className="auth-card__brand-label">Sistema de Reservas</p>
        </div>

        <h1 className="auth-card__title">Bienvenido</h1>
        <p className="auth-card__subtitle">Ingresa a tu cuenta para continuar</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
            <label className="auth-field__label" htmlFor="email">Correo electrónico</label>
            <div className="auth-field__input-wrap">
              <span className="auth-field__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="m2 7 10 7 10-7" />
                </svg>
              </span>
              <input
                id="email" name="email" type="email"
                autoComplete="email" placeholder="tu@correo.com"
                value={form.email} onChange={handleChange}
                className="auth-field__input"
              />
            </div>
            {errors.email && <span className="auth-field__error">{errors.email}</span>}
          </div>

          <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
            <label className="auth-field__label" htmlFor="password">Contraseña</label>
            <div className="auth-field__input-wrap">
              <span className="auth-field__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="password" name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password" placeholder="••••••••"
                value={form.password} onChange={handleChange}
                className="auth-field__input"
              />
              <button type="button" className="auth-field__eye"
                onClick={() => setShowPass((v) => !v)}>
                {showPass ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="auth-field__error">{errors.password}</span>}
          </div>

          {apiError && (
            <div className="auth-alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {apiError}
            </div>
          )}

          <button className={`auth-btn ${loading ? 'auth-btn--loading' : ''}`}
            type="submit" disabled={loading}>
            {loading ? <span className="auth-btn__spinner" /> : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿No tienes cuenta?{' '}
          <button className="auth-card__link" onClick={onGoRegister}>
            Regístrate aquí
          </button>
        </p>
        <div className="auth-card__divider"><span>✦</span></div>
      </div>
    </div>
  );
}