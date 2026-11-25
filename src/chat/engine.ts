/**
 * Motor del asistente basado en reglas (sin IA ni APIs pagas).
 * Normaliza el texto y busca palabras clave en español, inglés y portugués.
 *
 * Arquitectura lista para un modo IA futuro: `detectIntent` podría delegar en una ruta
 * de servidor (/api/chat) que llame a la API de Anthropic con la clave en el servidor,
 * devolviendo la misma lista de intents para conservar botones rápidos y flujo guiado.
 */

export type Intent =
  | "sedes"
  | "pet"
  | "precios"
  | "incluye"
  | "comida"
  | "comisiones"
  | "checkin"
  | "llegar"
  | "reservar"
  | "whatsapp"
  | "greet"
  | "thanks";

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Orden = prioridad ante empates. */
const KEYWORDS: [Intent, string[]][] = [
  ["comisiones", ["comision", "comisiones", "airbnb", "commission", "commissions", "comissao", "comissoes", "taxa de servico", "service fee", "sin cargo extra"]],
  ["comida", ["restaurante", "restaurant", "comida", "comidas", "desayuno", "almuerzo", "cena", "pension", "media pension", "breakfast", "lunch", "dinner", "meal", "meals", "food", "cafe da manha", "refeicao", "refeicoes", "almoco", "jantar"]],
  ["pet", ["mascota", "mascotas", "perro", "perros", "perra", "gato", "gatos", "pet", "pets", "dog", "dogs", "cat", "cats", "cachorro", "cachorros", "cao", "caes", "animal", "animales", "animais", "pet friendly"]],
  ["checkin", ["check in", "checkin", "check-in", "check out", "checkout", "check-out", "horario", "horarios", "hora de entrada", "hora de salida", "what time", "arrival time", "que horas", "a que hora"]],
  ["precios", ["precio", "precios", "tarifa", "tarifas", "cuesta", "cuestan", "cuanto", "valor", "valores", "sena", "senal", "deposito", "price", "prices", "pricing", "rate", "rates", "cost", "costs", "how much", "deposit", "preco", "precos", "quanto", "custa", "sinal", "diaria", "diarias", "usd", "dolares", "dollars"]],
  ["incluye", ["wifi", "wi-fi", "internet", "tv", "netflix", "parrilla", "asado", "grill", "churrasqueira", "cama", "bed", "aire acondicionado", "ar-condicionado", "air conditioning", "incluye", "incluyen", "equipada", "equipadas", "equipamiento", "cocina", "salamandra", "toallas", "sabanas", "ropa de cama", "include", "includes", "included", "amenities", "kitchen", "towels", "inclui", "incluem", "cozinha", "lareira", "toalhas", "que tiene", "que tienen"]],
  ["llegar", ["playa", "playas", "beach", "praia", "mar", "sea", "llegar", "llego", "como llego", "ruta", "omnibus", "bus", "auto", "montevideo", "get there", "getting there", "directions", "drive", "chegar", "onibus", "carro", "como chego", "rodoviaria"]],
  ["sedes", ["sede", "sedes", "donde", "ubicacion", "ubicados", "ubicadas", "quedan", "queda", "san sebastian", "where", "location", "locations", "located", "onde", "ficam", "fica", "localizacao", "endereco", "direccion", "address"]],
  ["reservar", ["reservar", "reserva", "reservo", "reservas", "disponibilidad", "disponible", "disponibles", "fechas", "libre", "book", "booking", "reserve", "availability", "available", "disponibilidade", "disponivel", "datas", "quero reservar"]],
  ["whatsapp", ["whatsapp", "wpp", "wsp", "hablar", "humano", "persona", "telefono", "contacto", "llamar", "talk", "human", "person", "contact", "call", "phone", "falar", "contato", "pessoa", "ligar"]],
  ["thanks", ["gracias", "thanks", "thank you", "thx", "obrigado", "obrigada", "valeu"]],
  ["greet", ["hola", "buenas", "buen dia", "hello", "hi", "hey", "good morning", "ola", "oi", "bom dia", "boa tarde", "boa noite"]],
];

function matches(text: string, words: string[], kw: string): boolean {
  if (kw.includes(" ") || kw.includes("-")) return ` ${text} `.includes(` ${kw} `) || text.includes(kw);
  if (kw.length >= 5) return words.some((w) => w.startsWith(kw));
  return words.includes(kw);
}

export function detectIntent(raw: string): Intent | null {
  const text = normalize(raw);
  if (!text) return null;
  const words = text.split(" ");
  let best: Intent | null = null;
  let bestScore = 0;
  for (const [intent, kws] of KEYWORDS) {
    let score = 0;
    for (const kw of kws) if (matches(text, words, kw)) score += kw.includes(" ") ? 2 : 1;
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return best;
}
