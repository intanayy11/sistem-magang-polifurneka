/**
 * Utility helper to clean and resolve storage file URLs.
 * Handles paths with or without 'storage/' prefix, leading slashes, or full URLs.
 * 
 * @param {string|null} path 
 * @returns {string}
 */
export const getStorageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  let cleanPath = path.replace(/^\//, ''); // Remove leading slash
  if (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.substring(8); // Remove leading 'storage/'
  }

  return `/storage/${cleanPath}`;
};
