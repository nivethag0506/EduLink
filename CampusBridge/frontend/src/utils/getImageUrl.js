export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Normalize path by replacing backslashes with forward slashes and removing leading slash
    let cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

    let baseUrl = import.meta.env.VITE_API_URL || '';
    // Remove trailing slash from baseUrl if present
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

    return baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;
};
