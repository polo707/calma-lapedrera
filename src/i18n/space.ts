import type { Lang } from "@/lib/types";

/** "Acerca del espacio": datos del predio y de las cabañas, tal como los describe Calma. */
const es = {
  n: "07",
  label: "El espacio",
  title: "Desenchufate, sin perder el confort",
  intro:
    "Calma está en San Sebastián de La Pedrera, en medio de una paz única y a solo 1 km del centro. Son tres cabañas idénticas, de estilo alpino escandinavo y decoración minimalista, en un predio cercado sobre milenarias cárcavas: por encima del nivel del mar, con vistas al mar, a las copas de los árboles y a un cielo infinito, entre aves y fauna silvestre.",
  facts: [
    { v: "3", k: "cabañas idénticas" },
    { v: "1.200 m²", k: "de predio cercado" },
    { v: "1 km", k: "del centro de La Pedrera" },
    { v: "15 min", k: "a la playa por senderos" },
  ],
  rooms: [
    { id: "dormitorio", t: "El dormitorio", d: "En el entrepiso: cama japonesa con colchón Queen de alta densidad. Aire acondicionado y, si preferís, ventilador." },
    { id: "cocina", t: "La cocina", d: "Anafe doble, horno eléctrico, heladera con freezer y todo para cocinar igual que en tu casa. Incluimos café, sal, azúcar y detergente." },
    { id: "bano", t: "El baño", d: "Calefón de 60 litros y una ducha potente con mampara y roseta gigante." },
    { id: "living", t: "El living", d: "Sillón cómodo, mesa y sillas de comedor y estufa a leña de alto rendimiento, para disfrutar las vistas." },
    { id: "deck", t: "El deck", d: "Da al mar y al borde de la cárcava, con parrilla individual a carbón. Un espectáculo al amanecer y al atardecer." },
    { id: "wifi", t: "Conectados", d: "WiFi y Smart TV de 43 pulgadas: para trabajar o para una tarde nublada de series." },
  ],
  commonsTitle: "Los espacios comunes",
  commons:
    "Cada cabaña tiene su espacio privado y acceso al resto del predio, con rincones naturales, un fogón y hamacas para leer, tomar un té o meditar con el sonido de los pájaros y el mar.",
  includedTitle: "Incluido",
  included: ["Sábanas", "Toallas: 2 de mano y 2 toallones", "Sillas de playa", "Café, sal, azúcar y detergente"],
  includedNote: "Sin recambio de ropa de cama y toallas en estadías de menos de 7 noches.",
  beach: "Playa a 15 minutos a pie por senderos de bosque, o a 5 minutos en auto.",
  follow: "Seguinos en @calmalapedrera",
};

export type Space = typeof es;

const en: Space = {
  n: "07",
  label: "The place",
  title: "Unplug, without giving up comfort",
  intro:
    "Calma is in San Sebastián de La Pedrera, in a rare kind of peace yet just 1 km from the village centre. Three identical cabins, Scandinavian-alpine in style with minimalist interiors, on a fenced plot above ancient gullies: raised above sea level, with views of the sea, the treetops and an endless sky, among birds and wildlife.",
  facts: [
    { v: "3", k: "identical cabins" },
    { v: "1,200 m²", k: "fenced plot" },
    { v: "1 km", k: "from La Pedrera's centre" },
    { v: "15 min", k: "to the beach on foot" },
  ],
  rooms: [
    { id: "dormitorio", t: "The bedroom", d: "On the mezzanine: a Japanese-style bed with a high-density Queen mattress. Air conditioning, plus a fan if you prefer." },
    { id: "cocina", t: "The kitchen", d: "Two-burner hob, electric oven, fridge-freezer and everything to cook just like at home. Coffee, salt, sugar and dish soap included." },
    { id: "bano", t: "The bathroom", d: "A 60-litre water heater feeding a powerful rain shower with a glass screen." },
    { id: "living", t: "The living room", d: "A comfortable sofa, dining table and chairs, and a high-efficiency wood stove to enjoy the views." },
    { id: "deck", t: "The deck", d: "Facing the sea and the edge of the gully, with its own charcoal grill. A show at sunrise and at sunset." },
    { id: "wifi", t: "Connected", d: "WiFi and a 43-inch Smart TV: for working, or for a cloudy afternoon of series." },
  ],
  commonsTitle: "Shared spaces",
  commons:
    "Each cabin has its own private space plus access to the rest of the plot, with natural corners, a fire pit and hammocks to read, have tea or meditate to the sound of birds and the sea.",
  includedTitle: "Included",
  included: ["Bed linen", "Towels: 2 hand and 2 bath", "Beach chairs", "Coffee, salt, sugar and dish soap"],
  includedNote: "No linen or towel change on stays shorter than 7 nights.",
  beach: "The beach is 15 minutes on foot through forest paths, or 5 minutes by car.",
  follow: "Follow us at @calmalapedrera",
};

const pt: Space = {
  n: "07",
  label: "O espaço",
  title: "Desconecte, sem abrir mão do conforto",
  intro:
    "A Calma fica em San Sebastián de La Pedrera, numa paz única e a apenas 1 km do centro. São três cabanas idênticas, de estilo alpino escandinavo e decoração minimalista, num terreno cercado sobre falésias milenares: acima do nível do mar, com vista para o mar, para as copas das árvores e para um céu infinito, entre aves e animais silvestres.",
  facts: [
    { v: "3", k: "cabanas idênticas" },
    { v: "1.200 m²", k: "de terreno cercado" },
    { v: "1 km", k: "do centro de La Pedrera" },
    { v: "15 min", k: "até a praia a pé" },
  ],
  rooms: [
    { id: "dormitorio", t: "O quarto", d: "No mezanino: cama japonesa com colchão Queen de alta densidade. Ar-condicionado e, se preferir, ventilador." },
    { id: "cocina", t: "A cozinha", d: "Cooktop duplo, forno elétrico, geladeira com freezer e tudo para cozinhar como em casa. Incluímos café, sal, açúcar e detergente." },
    { id: "bano", t: "O banheiro", d: "Aquecedor de 60 litros e um chuveiro potente, com box e ducha gigante." },
    { id: "living", t: "A sala", d: "Sofá confortável, mesa e cadeiras de jantar e lareira a lenha de alto rendimento, para aproveitar a vista." },
    { id: "deck", t: "O deck", d: "Voltado para o mar e para a borda da falésia, com churrasqueira individual a carvão. Um espetáculo ao nascer e ao pôr do sol." },
    { id: "wifi", t: "Conectados", d: "Wi-Fi e Smart TV de 43 polegadas: para trabalhar ou para uma tarde nublada de séries." },
  ],
  commonsTitle: "Áreas comuns",
  commons:
    "Cada cabana tem seu espaço privativo e acesso ao resto do terreno, com cantos naturais, fogueira e redes para ler, tomar um chá ou meditar ao som dos pássaros e do mar.",
  includedTitle: "Incluído",
  included: ["Roupa de cama", "Toalhas: 2 de rosto e 2 de banho", "Cadeiras de praia", "Café, sal, açúcar e detergente"],
  includedNote: "Sem troca de roupa de cama e toalhas em estadias de menos de 7 noites.",
  beach: "A praia fica a 15 minutos a pé por trilhas na mata, ou a 5 minutos de carro.",
  follow: "Siga @calmalapedrera",
};

const ALL: Record<Lang, Space> = { es, en, pt };
export const space = (lang: Lang): Space => ALL[lang];
