export const TulumZone = {
  ALL: "all",
  LA_VELETA: "la_veleta",
  ALDEA_ZAMA: "aldea_zama",
  CENTRO: "centro",
  ZONA_COSTERA: "zona_costera",
  REGION_15: "region_15",
  COBA: "coba",
} as const;

export type TulumZoneType = (typeof TulumZone)[keyof typeof TulumZone];

export const TULUM_ZONES = [
  "La Veleta",
  "Aldea Zama",
  "Centro",
  "Centro / Pueblo",
  "Zona Costera",
  "Zona Hotelera",
  "Boca Paila",
  "Region 15",
  "Cobá",
] as const;

export type TulumZone = (typeof TULUM_ZONES)[number];

export const BUSINESS_ZONES = [
  "La Veleta",
  "Aldea Zama",
  "Centro",
  "Zona Costera",
  "Region 15",
] as const;

export type BusinessZone = (typeof BUSINESS_ZONES)[number] | TulumZone;
