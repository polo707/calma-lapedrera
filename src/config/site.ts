/**
 * Configuración central del sitio.
 * Para cambiar el WhatsApp real, editá solo WHATSAPP_NUMBER (sin "+" ni espacios).
 */
export const WHATSAPP_NUMBER = "59899000000";

/** PIN de la demo para entrar a /admin. En producción, reemplazar por login real. */
export const ADMIN_PIN = "1234";

export const INSTAGRAM_HANDLE = "calmalapedrera";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
export const INSTAGRAM_FOLLOWERS = "33.000";

export const SITE_NAME = "Calma La Pedrera";
export const CURRENCY = "USD";

/** Clave de localStorage donde vive la fuente de datos compartida (web + chat + admin). */
export const STORAGE_KEY = "calma.data.v3";
export const LANG_KEY = "calma.lang";

/** Link exacto de Google Maps que pasó el cliente (botón "Abrir en Google Maps"). */
export const MAPS_URL = "https://maps.app.goo.gl/qjqYEFNUG6VXDaFG8";
/** Mapa embebido (sin API key). Cambiar la búsqueda por coordenadas exactas cuando las tengamos: "q=-34.59,-54.12". */
export const MAPS_EMBED = "https://www.google.com/maps?q=Calma+La+Pedrera,+Rocha,+Uruguay&z=14&output=embed";
