
export const getStorageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  let cleanPath = path.replace(/^\//, '');
  if (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.substring(8);
  }

  return `/storage/${cleanPath}`;
};

