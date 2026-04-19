export const normalizeHttpUrl = (raw: unknown) => {
  const v = String(raw ?? "").trim();
  if (!v) return null;

  // Si ya trae protocolo, lo dejamos
  if (/^https?:\/\//i.test(v)) return v;

  // Si el usuario puso "www.ejemplo.com" o "ejemplo.com", le agregamos https://
  return `https://${v}`;
};

export const isValidHttpUrl = (value: string | null | undefined) => {
  if (!value) return true;

  try {
    const u = new URL(value);

    // solo http/https
    if (!["http:", "https:"].includes(u.protocol)) return false;

    // opcional: exigir un dominio "real" (con punto) o localhost
    if (u.hostname !== "localhost" && !u.hostname.includes(".")) return false;

    return true;
  } catch {
    return false;
  }
};
