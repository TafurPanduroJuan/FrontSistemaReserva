/**
 * Rangos de precios estandarizados para todo el sistema.
 * `value` es lo que se guarda en el backend (campo `precio` de RestaurantEntity).
 * `label` y `rango` son solo para mostrar una versión más clara y profesional en la UI.
 */
export const PRICE_RANGES = [
  { value: "$",    label: "Económico", rango: "Menos de S/ 30"   },
  { value: "$$",   label: "Moderado",  rango: "S/ 30 - S/ 60"    },
  { value: "$$$",  label: "Premium",   rango: "S/ 60 - S/ 100"   },
  { value: "$$$$", label: "Gourmet",   rango: "Más de S/ 100"    },
];

export const getPriceInfo = (value) =>
  PRICE_RANGES.find((p) => p.value === value) || null;

export const getPriceLabel = (value) => getPriceInfo(value)?.label || "";

export const getPriceRango = (value) => getPriceInfo(value)?.rango || "";

/** Texto combinado listo para mostrar, ej: "$$ · Moderado" */
export const formatPrecio = (value) => {
  const info = getPriceInfo(value);
  return info ? `${info.value} · ${info.label}` : (value || "—");
};
