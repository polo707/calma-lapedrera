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
export const STORAGE_KEY = "calma.data.v1";
export const LANG_KEY = "calma.lang";
