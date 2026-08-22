export const getPosterUrl = (path, size = "w500") => {
  if (!path) return "/placeholder.png";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getBackdropUrl = (path, size = "w1280") => {
  if (!path) return "/placeholder-wide.png";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getProfileUrl = (path, size = "w300") => {
  if (!path) return "/avatar.png";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
