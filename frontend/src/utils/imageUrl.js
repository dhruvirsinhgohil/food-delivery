import api from "../api/axios";

const apiRoot = api.defaults.baseURL
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

export function getImageUrl(image) {
  if (typeof image !== "string" || !image.trim()) return "";

  const imagePath = image.trim();
  const localImage = imagePath.match(
    /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/.*)?$/i
  );

  if (localImage) {
    return `${apiRoot}${localImage[1] || "/"}`;
  }

  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  return `${apiRoot}/${imagePath.replace(/^\/+/, "")}`;
}
