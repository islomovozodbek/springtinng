export function getRankTitle(level) {
  if (level <= 10) return "NPC";
  if (level <= 20) return "Locked In";
  if (level <= 30) return "He's HIM";
  if (level <= 40) return "Honoured One";
  if (level <= 50) return "Final Boss";
  return "GOAT";
}
