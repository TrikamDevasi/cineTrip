export function analyzeText(text) {
  return {
    length: text.length,
    words: text.split(" ").length,
    uppercase: text.toUpperCase(),
  };
}

export function recommendMovies(input) {
  return [
    "Sample Recommendation 1",
    "Sample Recommendation 2",
    "Sample Recommendation 3",
  ];
}

export function findSimilarMovies(name) {
  return [
    `${name} - Similar Movie A`,
    `${name} - Similar Movie B`,
  ];
}
