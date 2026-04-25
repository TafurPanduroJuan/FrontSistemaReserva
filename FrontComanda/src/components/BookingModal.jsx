import React, { useState, useMemo } from 'react';
import "../assets/styles/bookingModal.css";

const BookingModal = ({ isOpen, onClose, restaurante }) => {
  const [step, setStep] = useState(2); 

  const minDate = useMemo(() => {
    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);
    return mañana.toISOString().split('T')[0];
  }, []);

  const [formData, setFormData] = useState({
    fecha: minDate,
    hora: '18:00',
    personas: 2,
    nombre: '',
    email: '',
    telefono: ''
  });

  const horarios = ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

  if (!isOpen || !restaurante) return null;

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn-top" onClick={onClose}>&times;</button>
        
        <div className="modal-header-stepper">
          <h2>Reserva tu Mesa</h2>
          <div className="stepper-visual">
            {/* Paso 1: Siempre completado ya que el restaurante ya viene seleccionado */}
            <div className="step-item completed">
              <div className="step-circle">✓</div>
              <span className="step-label">Restaurante</span>
              <div className="step-line"></div>
            </div>

            {/* Paso 2: Verde si ya pasó, Naranja si es el actual */}
            <div className={`step-item ${step > 2 ? 'completed' : step === 2 ? 'active' : ''}`}>
              <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
              <span className="step-label">Fecha y Hora</span>
              <div className="step-line"></div>
            </div>

            {/* Paso 3: Verde si ya pasó, Naranja si es el actual */}
            <div className={`step-item ${step > 3 ? 'completed' : step === 3 ? 'active' : ''}`}>
              <div className="step-circle">{step > 3 ? '✓' : '3'}</div>
              <span className="step-label">Tus Datos</span>
              <div className="step-line"></div>
            </div>

            {/* Paso 4: Final */}
            <div className={`step-item ${step === 4 ? 'active' : ''}`}>
              <div className="step-circle">4</div>
              <span className="step-label">Confirmar</span>
            </div>
          </div>
        </div>

        <div className="modal-body-content">
          <div className="res-hero-banner">
            <img src={restaurante.img} alt={restaurante.nombre} />
            <div className="res-hero-info">
              <h4>{restaurante.nombre}</h4>
              <p>{restaurante.tipo} • {restaurante.lugar}</p>
            </div>
          </div>

          {step === 2 && (
            <div className="step-container anim-fade-in">
              <h3 className="section-title">¿Cuándo nos visitas?</h3>
              <div className="row-inputs">
                <div className="input-group">
                  <label>📅 Fecha de la Reserva</label>
                  <input type="date" className="modern-field" min={minDate} value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>👥 Personas</label>
                  <div className="people-selector">
                    <button onClick={() => setFormData({...formData, personas: Math.max(1, formData.personas - 1)})}>-</button>
                    <span>{formData.personas}</span>
                    <button onClick={() => setFormData({...formData, personas: formData.personas + 1})}>+</button>
                  </div>
                </div>
              </div>
              <label className="label-margin">🕒 Horarios disponibles</label>
              <div className="time-grid">
                {horarios.map((h) => (
                  <button key={h} className={`time-chip ${formData.hora === h ? 'selected' : ''}`} onClick={() => setFormData({...formData, hora: h})}>{h}</button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-container anim-fade-in">
              <h3 className="section-title">Tus Datos de Contacto</h3>
              <div className="form-stack">
                <div className="input-group">
                    <label>Nombre Completo</label>
                    <input type="text" placeholder="Ej. Juan Pérez" className="modern-field" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div className="input-group">
                    <label>Correo Electrónico</label>
                    <input type="email" placeholder="juan@ejemplo.com" className="modern-field" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="input-group">
                    <label>Teléfono</label>
                    <input type="tel" placeholder="+52 55 1234 5678" className="modern-field" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="step-container anim-fade-in confirmation-view">
              <div className="success-icon">✓</div>
              <h3 className="section-title">¡Todo listo para tu reserva!</h3>
              <div className="summary-card">
                <div className="summary-item"><span>Restaurante:</span> <strong>{restaurante.nombre}</strong></div>
                <div className="summary-item"><span>Fecha:</span> <strong>{formData.fecha}</strong></div>
                <div className="summary-item"><span>Hora:</span> <strong>{formData.hora}</strong></div>
                <div className="summary-item"><span>Personas:</span> <strong>{formData.personas}</strong></div>
                <div className="summary-item"><span>Nombre:</span> <strong>{formData.nombre}</strong></div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer-actions">
          <button className="btn-back" onClick={handleBack} style={{ visibility: step === 2 ? 'hidden' : 'visible' }}>← Atrás</button>
          <button className="btn-next-red" onClick={step === 4 ? onClose : handleNext}>
            {step === 4 ? "Finalizar" : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;