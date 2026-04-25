import React, { useState } from 'react';
import "../assets/styles/bookingModal.css";

const BookingModal = ({ isOpen, onClose, restaurante }) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  // Reiniciar el modal al cerrar
  const closeAndReset = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={closeAndReset}>&times;</button>
        
        <h2 className="modal-title">Reserva tu Mesa</h2>
        <p className="modal-subtitle">Sigue los pasos para confirmar en {restaurante.nombre}</p>

        {/* Indicador de pasos (Stepper) */}
        <div className="stepper">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className={`step-item ${step >= num ? 'active' : ''}`}>
              <div className="step-number">{num}</div>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="step-fade-in">
              <h3>Restaurante Seleccionado</h3>
              <div className="res-preview-card">
                <img src={restaurante.img} alt={restaurante.nombre} />
                <div className="res-preview-info">
                  <h4>{restaurante.nombre}</h4>
                  <p>📍 {restaurante.lugar}</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-fade-in">
              <h3>Fecha y Hora</h3>
              <input type="date" className="modal-input" />
              <input type="time" className="modal-input" />
            </div>
          )}

          {step === 3 && (
            <div className="step-fade-in">
              <h3>Tus Datos</h3>
              <input type="text" placeholder="Nombre completo" className="modal-input" />
              <input type="email" placeholder="Correo electrónico" className="modal-input" />
            </div>
          )}

          {step === 4 && (
            <div className="step-fade-in success-msg">
              <span className="check-icon">✓</span>
              <h3>Confirmación</h3>
              <p>¿Deseas finalizar tu reserva para {restaurante.nombre}?</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && <button className="btn-modal-secondary" onClick={handleBack}>Atrás</button>}
          {step < 4 ? (
            <button className="btn-modal-primary" onClick={handleNext}>Siguiente</button>
          ) : (
            <button className="btn-modal-primary" onClick={closeAndReset}>Confirmar Reserva</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;