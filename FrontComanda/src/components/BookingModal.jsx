import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import "../assets/styles/bookingModal.css";

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadReservas() {
  try {
    const raw = localStorage.getItem("comanda_reservas_maestro");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveReserva(reserva) {
  try {
    const todas = loadReservas();
    const nueva = { ...reserva, id: Date.now() };
    localStorage.setItem("comanda_reservas_maestro", JSON.stringify([...todas, nueva]));
    return nueva;
  } catch { return reserva; }
}

// ── Genera mesas según la capacidad del restaurante ───────────────────────────
function generarMesas(totalMesas) {
  const zonas = ["Terraza", "Salón Interior", "VIP"];
  const n = Math.max(totalMesas || 6, 3);
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    zona: zonas[Math.floor(i / Math.ceil(n / 3))] || "Salón Interior",
    capacidad: [2, 4, 4, 6, 2, 4, 2, 8, 4, 4, 2, 4][i] || 4,
  }));
}

const STEPS = [
  { label: "Restaurante" },
  { label: "Fecha y Hora" },
  { label: "Tu Mesa" },
  { label: "Tus Datos" },
  { label: "Confirmar" },
];

const BookingModal = ({ isOpen, onClose, restaurante }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  const minDate = useMemo(() => {
    const m = new Date();
    m.setDate(m.getDate() + 1);
    return m.toISOString().split('T')[0];
  }, []);

  const [formData, setFormData] = useState({
    fecha: minDate,
    hora: '18:00',
    personas: 2,
    mesa: null,
    zona: '',
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: '',
    notas: '',
  });

  const horarios = ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
  const mesas = useMemo(() => generarMesas(restaurante?.mesas), [restaurante]);
  const zonas = useMemo(() => [...new Set(mesas.map(m => m.zona))], [mesas]);
  const mesasFiltradas = formData.zona ? mesas.filter(m => m.zona === formData.zona) : mesas;
  
  const handleTelefono = (e) => {
    const valor = e.target.value.replace(/\D/g, "").slice(0, 9);
    setFormData({ ...formData, telefono: valor });
  };
  const telefonoValido = formData.telefono.length === 9;
  
  if (!isOpen || !restaurante) return null;
  

  const canProceed = () => {
    if (step === 2) return !!formData.fecha && !!formData.hora;
    if (step === 3) return formData.mesa !== null;
    if (step === 4) return formData.nombre.trim() && formData.email.trim() && formData.telefono.trim();
    return true;
  };

  const handleNext = () => {
    if (step === 5) {
      saveReserva({
        cliente: formData.nombre,
        email: formData.email,
        tel: formData.telefono,
        restaurante: restaurante.nombre,
        fecha: formData.fecha,
        hora: formData.hora,
        personas: formData.personas,
        mesa: formData.mesa,
        zona: formData.zona,
        notas: formData.notas,
        estado: "pendiente",
      });
      onClose();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step === 1) onClose();
    else setStep(prev => prev - 1);
  };

  return (
    <div id="comanda-booking-modal">
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn-top" onClick={onClose}>&times;</button>

        {/* STEPPER */}
        <div className="modal-header-stepper">
          <h2>Reserva tu Mesa</h2>
          <div className="stepper-visual">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className={`step-item ${done ? 'completed' : active ? 'active' : ''}`}>
                  <div className="step-circle">{done ? '✓' : n}</div>
                  <span className="step-label">{s.label}</span>
                  {n < STEPS.length && <div className="step-line"></div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-body-content">
          {/* Banner siempre visible */}
          <div className="res-hero-banner">
            <img src={restaurante.img} alt={restaurante.nombre} />
            <div className="res-hero-info">
              <h4>{restaurante.nombre}</h4>
              <p>{restaurante.tipo} · {restaurante.lugar}</p>
            </div>
          </div>

          {/* PASO 1 */}
          {step === 1 && (
            <div className="step-container anim-fade-in">
              <h3 className="section-title">🍽️ ¡Has elegido bien!</h3>
              <div className="rest-confirm-box">
                {[
                  ["📍 Ubicación", restaurante.lugar],
                  ["🏷️ Tipo de cocina", restaurante.tipo],
                  ["⭐ Calificación", `${restaurante.rating} (${restaurante.reseñas}+ reseñas)`],
                  ["💰 Precio", restaurante.precio],
                  ["🍽️ Mesas disponibles", restaurante.mesas],
                ].map(([label, val]) => (
                  <div key={label} className="rest-confirm-row">
                    <span>{label}</span><strong>{val}</strong>
                  </div>
                ))}
              </div>
              <p style={{ color: '#888', fontSize: '0.88rem', marginTop: '16px', textAlign: 'center' }}>
                Presiona <strong>Siguiente</strong> para continuar con tu reserva.
              </p>
            </div>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <div className="step-container anim-fade-in">
              <h3 className="section-title mb-2">📅 ¿Cuándo nos visitas?</h3>
              <div className="row-inputs">
                <div className="input-group">
                  <label>📅 Fecha</label>
                  <input type="date" className="modern-field" min={minDate} value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} />
                </div>
                <div className="input-group center-content">
                  <label>👥 Personas</label>
                  <div className="people-selector">
                    <button onClick={() => setFormData({ ...formData, personas: Math.max(1, formData.personas - 1) })}>-</button>
                    <span>{formData.personas}</span>
                    <button onClick={() => setFormData({ ...formData, personas: formData.personas + 1 })}>+</button>
                  </div>
                </div>
              </div>
              <label className="label-margin">🕒 Horarios disponibles</label>
              <div className="time-grid">
                {horarios.map((h) => (
                  <button key={h} className={`time-chip ${formData.hora === h ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, hora: h })}>{h}</button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 3: Mesa y ubicación */}
          {step === 3 && (
            <div className="step-container anim-fade-in">
              <h3 className="section-title">📍 Elige tu Ubicación</h3>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: '#555' }}>🏠 Filtrar por zona</label>
                <div className="zona-chips">
                  <button className={`zona-chip ${formData.zona === '' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, zona: '', mesa: null })}>Todas</button>
                  {zonas.map(z => (
                    <button key={z} className={`zona-chip ${formData.zona === z ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, zona: z, mesa: null })}>{z}</button>
                  ))}
                </div>
              </div>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '0.9rem', color: '#555' }}>🪑 Selecciona una mesa</label>
              <div className="mesas-grid">
                {mesasFiltradas.map(m => {
                  const isSelected = formData.mesa === m.id;
                  const tooSmall = m.capacidad < formData.personas;
                  const emoji = m.capacidad >= 6 ? '🏯' : m.capacidad >= 4 ? '🍽️' : '☕';
                  return (
                    <div key={m.id}
                      className={`mesa-card ${isSelected ? 'selected' : ''} ${tooSmall ? 'too-small' : ''}`}
                      onClick={() => !tooSmall && setFormData({ ...formData, mesa: m.id, zona: m.zona })}
                    >
                      {isSelected && <div className="mesa-check">✓</div>}
                      <div className="mesa-emoji">{emoji}</div>
                      <div className="mesa-num">Mesa {m.numero}</div>
                      <div className="mesa-info">{m.zona}</div>
                      <div className="mesa-cap">
                        {tooSmall
                          ? <span style={{ color: '#e74c3c', fontSize: '0.65rem' }}>Cap. insuficiente</span>
                          : `${m.capacidad} pers.`}
                      </div>
                    </div>
                  );
                })}
              </div>
              {formData.mesa && (
                <p style={{ color: '#2ecc71', fontWeight: 600, marginTop: '14px', textAlign: 'center', fontSize: '0.9rem' }}>
                  ✓ Mesa {formData.mesa} — {formData.zona}
                </p>
              )}
            </div>
          )}

          {/* PASO 4 */}
          {step === 4 && (
            <div className="step-container anim-fade-in">
              <h3 className="section-title">👤 Tus Datos de Contacto</h3>
              <div className="form-stack">
                <div className="input-group">
                  <label>Nombre Completo</label>
                  <input type="text" placeholder="Ej. Juan Pérez" className="modern-field"
                    value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Correo Electrónico</label>
                  <input type="email" placeholder="juan@ejemplo.com" className="modern-field"
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="999 123 456"
                    className={`modern-field ${formData.telefono.length > 0 && !telefonoValido ? "field-error" : ""}`}
                    value={formData.telefono}
                    onChange={handleTelefono}
                    maxLength={9}
                  />
                  {formData.telefono.length > 0 && !telefonoValido && (
                    <small className="field-hint-error">
                      <i className="bi bi-exclamation-circle me-1" />
                      Debe tener exactamente 9 dígitos ({formData.telefono.length}/9)
                    </small>
                  )}
                  {telefonoValido && (
                    <small className="field-hint-ok">
                      <i className="bi bi-check-circle me-1" />
                      Teléfono válido
                    </small>
                  )}
                </div>
                <div className="input-group full-width">
                  <label>Observaciones (opcional)</label>
                  <textarea placeholder="Cumpleaños, alergias, preferencias de ubicación..."
                    className="modern-field" rows={3} value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>
          )}

          {/* PASO 5 */}
          {step === 5 && (
            <div className="step-container anim-fade-in confirmation-view">
              <div className="success-icon">✓</div>
              <h3 className="section-title">¡Todo listo para tu reserva!</h3>
              <div className="summary-card">
                {[
                  ["Restaurante", restaurante.nombre],
                  ["Fecha", formData.fecha],
                  ["Hora", formData.hora],
                  ["Personas", formData.personas],
                  ["Mesa", `Mesa ${formData.mesa} — ${formData.zona}`],
                  ["Nombre", formData.nombre],
                  ["Contacto", `${formData.email} · ${formData.telefono}`],
                  ...(formData.notas ? [["Notas", formData.notas]] : []),
                ].map(([label, val]) => (
                  <div key={label} className="summary-item">
                    <span>{label}:</span><strong>{val}</strong>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '14px', color: '#888', fontSize: '0.82rem', textAlign: 'center' }}>
                Tu reserva quedará en estado <strong>pendiente</strong> hasta que el restaurante la confirme.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer-actions">
          <button className="btn-back" onClick={handleBack}>
            {step === 1 ? '✕ Cerrar' : '← Atrás'}
          </button>
          <button
            className="btn-next-red"
            onClick={handleNext}
            disabled={!canProceed()}
            style={{ opacity: canProceed() ? 1 : 0.5, cursor: canProceed() ? 'pointer' : 'not-allowed' }}
          >
            {step === 5 ? '✓ Confirmar Reserva' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default BookingModal;