// Division configuration types
export interface Division {
  id: string;
  label: string;
}

export type DivisionConfig = Division[];

// Default division configurations
export const DEFAULT_RGL_HL_DIVISIONS: DivisionConfig = [
  { id: "invite", label: "INVITE" },
  { id: "advanced", label: "ADVANCED" },
  { id: "main", label: "MAIN" },
  { id: "intermediate", label: "INTERMEDIATE" },
  { id: "amateur", label: "AMATEUR" },
  { id: "newcomer", label: "NEWCOMER" },
];

export const DEFAULT_RGL_6S_DIVISIONS: DivisionConfig = [
  { id: "invite", label: "INVITE" },
  { id: "advanced", label: "ADVANCED" },
  { id: "main", label: "MAIN" },
  { id: "intermediate", label: "INTERMEDIATE" },
  { id: "amateur", label: "AMATEUR" },
  { id: "newcomer", label: "NEWCOMER" },
];

export const DEFAULT_OZF_DIVISIONS: DivisionConfig = [
  { id: "premier", label: "PREMIER" },
  { id: "high", label: "HIGH" },
  { id: "intermediate", label: "INTERMEDIATE" },
  { id: "main", label: "MAIN" },
  { id: "open", label: "OPEN" },
];

export const DEFAULT_OZF_6S_DIVISIONS: DivisionConfig = [
  { id: "premier", label: "PREMIER" },
  { id: "high", label: "HIGH" },
  { id: "intermediate", label: "INTERMEDIATE" },
  { id: "main", label: "MAIN" },
  { id: "open", label: "OPEN" },
];

export const DEFAULT_OZF_HL_DIVISIONS: DivisionConfig = [
  { id: "premier", label: "PREMIER" },
  { id: "intermediate", label: "INTERMEDIATE" },
  { id: "main", label: "MAIN" },
];

export const DEFAULT_OZF_LAN_DIVISIONS: DivisionConfig = [
  { id: "LDU 2025", label: "LDU 2025" },
];

// Custom division overrides for specific seasons
export const CUSTOM_DIVISIONS: Record<string, DivisionConfig> = {
  // RGL HL S22 (ID 166) - New structure with Advanced-1 and Advanced-2
  "166": [
    { id: "invite", label: "INVITE" },
    { id: "advanced-1", label: "ADVANCED-1" },
    { id: "advanced-2", label: "ADVANCED-2" },
    { id: "main", label: "MAIN" },
    { id: "amateur", label: "AMATEUR" },
    { id: "newcomer", label: "NEWCOMER" },
  ],
  // RGL HL S20 (ID 158) - Check actual division structure
  "158": [
    { id: "invite", label: "INVITE" },
    { id: "advanced-1", label: "ADVANCED-1" },
    { id: "advanced-2", label: "ADVANCED-2" },
    { id: "main", label: "MAIN" },
    { id: "amateur", label: "AMATEUR" },
    { id: "newcomer", label: "NEWCOMER" },
  ],
};

// Helper function to get divisions for a season
export const getDivisionsForSeason = (
  seasonId: string,
  format: "HL" | "6S" | "LAN",
  league: "RGL" | "OZF"
): DivisionConfig => {
  // Check for custom override first
  if (CUSTOM_DIVISIONS[seasonId]) {
    return CUSTOM_DIVISIONS[seasonId];
  }

  // Return appropriate default based on league and format
  if (league === "RGL") {
    return format === "HL" ? DEFAULT_RGL_HL_DIVISIONS : DEFAULT_RGL_6S_DIVISIONS;
  } else {
    // OZF
    if (format === "LAN") return DEFAULT_OZF_LAN_DIVISIONS;
    if (format === "HL") return DEFAULT_OZF_HL_DIVISIONS;
    return DEFAULT_OZF_6S_DIVISIONS;
  }
};
