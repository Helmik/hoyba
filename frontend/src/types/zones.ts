export const TulumZone = {
  ALL: "all",
  LA_VELETA: "la_veleta",
  ALDEA_ZAMA: "aldea_zama",
  CENTRO: "centro",
  ZONA_COSTERA: "zona_costera",
} as const;

export type TulumZoneType = (typeof TulumZone)[keyof typeof TulumZone];
