import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTables } from '../context/TablesContext';
import "../assets/styles/bookingModal.css";

const STEPS = [
  { label: "Restaurante" },
  { label: "Fecha y Hora" },
  { label: "Tu Mesa" },
  { label: "Tus Datos" },
  { label: "Confirmar" },
];

const BookingModal = ({ isOpen, onClose, restaurante }) => {
  const { user } = useAuth();
  const { getMesasDisponibles, agregarReserva } = useTables();

  const [step, setStep] = useState(1);
  const [mesas, setMesas] = useState([]);
  const [cargandoMesas, setCargandoMesas] = useState(false);
  const [enviando, setEnviando] = useState(false);

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
    mesaNumero: null,
    zona: '',
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: '',
    notas: '',
  });

  const horarios = ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

  // Cargar mesas reales del backend al llegar al paso 3
  useEffect(() => {
    if (step === 3 && restaurante?.id) {
      setCargandoMesas(true);
      getMesasDisponibles(restaurante.id, formData.zona || null)
        .then(setMesas)
        .catch(console.error)
        .finally(() => setCargandoMesas(false));
    }
  }, [step, restaurante?.id, formData.zona]);

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

  const handleNext = async () => {
    if (step === 5) {
      setEnviando(true);
      try {
        await agregarReserva({
          restaurantId: restaurante.id,
          mesaNumero:   formData.mesaNumero,
          zona:         formData.zona,
          cliente:      formData.nombre,
          email:        formData.email,
          tel:          parseInt(formData.telefono),
          fecha:        formData.fecha,
          hora:         formData.hora,
          personas:     formData.personas,
          notas:        formData.notas || null,
        });
        onClose();
      } catch (err) {
        alert("Error al confirmar la reserva: " + err.message);
      } finally {
        setEnviando(false);
      }
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
            <div className="step-container anim-fade-in p-1">
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
                    onClick={() => setFormData({ ...formData, zona: '', mesa: null, mesaNumero: null })}>Todas</button>
                  {zonas.map(z => (
                    <button key={z} className={`zona-chip ${formData.zona === z ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, zona: z, mesa: null, mesaNumero: null })}>{z}</button>
                  ))}

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
                    className="modern-field observations-field" value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })} />
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
                  ["Mesa", `Mesa ${formData.mesaNumero} — ${formData.zona}`],
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
      </div>
    </div>
    </div>
  );
};

export default BookingModal;
