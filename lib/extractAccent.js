export function extractAccent(color) {
  if (!color) return "#fff";

  // Extract a brighter accent shade
  let c = color.replace("#", "");
  if (c.length === 3) {
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  }

  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);

  r = Math.min(255, r + 40);
  g = Math.min(255, g + 40);
  b = Math.min(255, b + 40);

  return `rgb(${r}, ${g}, ${b})`;
}
