/**
 * Вспомогательная функция для корректного разрешения путей к статическим ресурсам
 * с учетом базового пути (base_url) для локальной разработки и GitHub Pages.
 */
export const getAssetUrl = (url?: string): string => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const base = import.meta.env.BASE_URL || "/";
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
};

export const DEFAULT_IMAGE = getAssetUrl("/DefaultImage.png");
export const DEFAULT_VIDEO = getAssetUrl("/DefaultVideo.mp4");
