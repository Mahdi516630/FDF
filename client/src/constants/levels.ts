export const REFEREE_LEVELS = [
  "Élite",
  "International",
  "National A",
  "National B",
  "Régional",
  "Stagiaire",
] as const;

export type RefereeLevel = typeof REFEREE_LEVELS[number];

export const LEVEL_COLORS: Record<string, string> = {
  "Élite":         "#f59e0b",
  "International": "#10b981",
  "National A":    "#3b82f6",
  "National B":    "#8b5cf6",
  "Régional":      "#06b6d4",
  "Stagiaire":     "#6b7280",
};
