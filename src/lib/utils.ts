/** Format a stroke name like "forehand_smash" → "Forehand Smash" */
export function formatStroke(stroke: string | undefined | null): string {
  if (!stroke) return "—";
  return stroke
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Get effectiveness color class */
export function effColor(eff: number): string {
  if (eff >= 65) return "text-[var(--success)]";
  if (eff >= 45) return "text-[#3c3c3c]";
  return "text-[var(--danger)]";
}

/** Get effectiveness background */
export function effBg(eff: number): string {
  if (eff >= 65) return "var(--success-bg)";
  if (eff >= 45) return "#f2f2f2";
  return "var(--danger-bg)";
}

/** Get bottom bar color */
export function effBarColor(eff: number): string {
  if (eff >= 65) return "var(--success-dark)";
  if (eff >= 45) return "var(--neutral-bar)";
  return "var(--danger-dark)";
}

/** Classification badge color */
export function classificationStyle(classification: string): { bg: string; text: string } {
  switch (classification) {
    case "weapon":
      return { bg: "var(--success-badge-bg)", text: "var(--success)" };
    case "hidden_weapon":
      return { bg: "var(--success-badge-bg)", text: "var(--success)" };
    case "liability":
      return { bg: "var(--danger-badge-bg)", text: "var(--danger)" };
    case "dual_nature":
      return { bg: "var(--warning-badge-bg)", text: "var(--warning)" };
    case "concern":
      return { bg: "rgba(108,108,108,0.12)", text: "var(--text-subtext)" };
    default:
      return { bg: "rgba(108,108,108,0.12)", text: "var(--text-subtext)" };
  }
}

/** Format classification label */
export function classificationLabel(c: string): string {
  switch (c) {
    case "weapon": return "Weapon";
    case "hidden_weapon": return "Hidden Weapon";
    case "liability": return "Liability";
    case "dual_nature": return "Dual Nature";
    case "concern": return "Concern";
    default: return formatStroke(c);
  }
}
