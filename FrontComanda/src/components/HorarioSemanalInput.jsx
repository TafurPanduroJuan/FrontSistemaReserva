import React from "react";

const DIAS = [
  { key: "lunes",     label: "Lunes"     },
  { key: "martes",    label: "Martes"    },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves",    label: "Jueves"    },
  { key: "viernes",   label: "Viernes"   },
  { key: "sabado",    label: "Sábado"    },
  { key: "domingo",   label: "Domingo"   },
];

export const horarioVacio = () =>
  Object.fromEntries(
    DIAS.map(({ key }) => [key, { apertura: "", cierre: "", abierto: false }])
  );

/**
 * Convierte el objeto de horarios a los campos planos que espera el backend.
 * Cada día abierto → "HH:mm-HH:mm", cerrado → null.
 */
export const horarioToPayload = (horarios) =>
  Object.fromEntries(
    DIAS.map(({ key }) => {
      const d = horarios[key];
      const val = d.abierto && d.apertura && d.cierre
        ? `${d.apertura}-${d.cierre}`
        : null;
      return [`horario${key.charAt(0).toUpperCase() + key.slice(1)}`, val];
    })
  );

/**
 * Convierte los campos planos del backend al objeto de horarios.
 * Útil para pre-cargar datos al editar.
 */
export const payloadToHorario = (data) => {
  const result = horarioVacio();
  DIAS.forEach(({ key }) => {
    const campo = `horario${key.charAt(0).toUpperCase() + key.slice(1)}`;
    const val = data[campo];
    if (val) {
      const [apertura, cierre] = val.split("-");
      result[key] = { apertura: apertura || "", cierre: cierre || "", abierto: true };
    }
  });
  return result;
};

function HorarioSemanalInput({ value, onChange, inputStyle, inputClassName = "rr-input" }) {
  const handleToggle = (key) => {
    onChange({
      ...value,
      [key]: { ...value[key], abierto: !value[key].abierto },
    });
  };

  const handleTime = (key, campo, val) => {
    onChange({
      ...value,
      [key]: { ...value[key], [campo]: val },
    });
  };

  // Estilos internos (solo se usan si NO se pasa inputClassName)
  const baseInput = {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1.5px solid #e8e0d8",
    fontSize: "0.85rem",
    outline: "none",
    background: "white",
    width: "100%",
    fontFamily: "inherit",
  };

  const getInputStyle = inputStyle
    ? inputStyle
    : () => baseInput;

  const getInputClass = inputStyle ? undefined : inputClassName;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Cabecera */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "100px 36px 1fr auto 1fr",
        gap: "0 8px",
        alignItems: "center",
        paddingBottom: 4,
        borderBottom: "1px solid #f0ece6",
        marginBottom: 2,
      }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase" }}>Día</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", textAlign: "center" }}>Abre</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", textAlign: "center" }}>Apertura</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", textAlign: "center" }}>Cierre</span>
        <span />
      </div>

      {DIAS.map(({ key, label }) => {
        const dia = value[key];
        return (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "100px 36px 1fr auto 1fr",
              gap: "0 8px",
              alignItems: "center",
              padding: "4px 0",
              opacity: dia.abierto ? 1 : 0.5,
              transition: "opacity 0.2s",
            }}
          >
            {/* Nombre del día */}
            <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#333" }}>{label}</span>

            {/* Toggle abierto */}
            <label style={{ display: "flex", justifyContent: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={dia.abierto}
                onChange={() => handleToggle(key)}
                style={{ width: 16, height: 16, accentColor: "#F4956A", cursor: "pointer" }}
              />
            </label>

            {/* Hora apertura */}
            <input
              type="time"
              value={dia.apertura}
              disabled={!dia.abierto}
              onChange={(e) => handleTime(key, "apertura", e.target.value)}
              className={getInputClass}
              style={inputStyle ? getInputStyle(`horario_${key}_apertura`) : baseInput}
            />

            {/* Separador */}
            <span style={{ textAlign: "center", color: "#bbb", fontSize: "0.85rem" }}>–</span>

            {/* Hora cierre */}
            <input
              type="time"
              value={dia.cierre}
              disabled={!dia.abierto}
              onChange={(e) => handleTime(key, "cierre", e.target.value)}
              className={getInputClass}
              style={inputStyle ? getInputStyle(`horario_${key}_cierre`) : baseInput}
            />
          </div>
        );
      })}

      <p style={{ fontSize: "0.73rem", color: "#aaa", margin: "6px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
        <i className="bi bi-info-circle" />
        Marca el checkbox del día para habilitarlo y luego ingresa la hora de apertura y cierre.
      </p>
    </div>
  );
}

export default HorarioSemanalInput;
