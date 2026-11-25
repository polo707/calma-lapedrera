import type { Lang, SedeId } from "@/lib/types";

/**
 * Textos extra de las secciones (Sedes, Cabañas, Entorno, Mascotas, Cómo llegar, Footer).
 * Complementan dict.ts sin modificarlo. Mismas claves en los tres idiomas.
 */
type Extra = {
  sedes: {
    tabsLabel: string;
    landscape: string;
    where: string;
    cabins: string;
    apart: string;
    alt: Record<SedeId, string>;
  };
  cabins: {
    pickLabel: string;
    from: string;
    stageAlt: (name: string, kind: string, sede: string) => string;
    insideTitle: string;
    insideLead: string;
    insideScroller: string;
    prev: string;
    next: string;
    inside: string[];
  };
  entorno: {
    title: string;
    lead: string;
    items: string[];
  };
  pets: {
    alt: string;
    maxLabel: string;
    feeLabel: string;
    perStay: string;
    cta: string;
  };
  location: {
    mapTitle: string;
    mapNote: string;
    open: string;
    sedesTitle: string;
  };
  footer: {
    sedes: string;
    contact: string;
    explore: string;
    top: string;
    newTab: string;
  };
};

export const sectionsExtra: Record<Lang, Extra> = {
  es: {
    sedes: {
      tabsLabel: "Elegí una sede",
      landscape: "Paisaje",
      where: "Dónde",
      cabins: "Cabañas",
      apart: "1 km · 3 min",
      alt: {
        pedrera: "Cartel de madera en el bosque con los senderos Agua, Tierra, Aire y Calma",
        sansebastian: "Camino de tierra entre eucaliptos altos en San Sebastián de La Pedrera",
      },
    },
    cabins: {
      pickLabel: "Elegí una cabaña",
      from: "desde",
      stageAlt: (name, kind, sede) => `Cabaña ${name}: ${kind.toLowerCase()} en ${sede}`,
      insideTitle: "Por dentro",
      insideLead: "Deslizá para recorrer una cabaña.",
      insideScroller: "Fotos del interior de las cabañas. Deslizá o usá las flechas para ver más.",
      prev: "Foto anterior",
      next: "Foto siguiente",
      inside: [
        "El living frente al ventanal",
        "La cama en el altillo",
        "El baño, todo en madera",
        "Una picada frente a la salamandra",
        "La salamandra encendida, de noche",
        "El living a plena luz del día",
      ],
    },
    entorno: {
      title: "Bosque de día, cielo de noche",
      lead: "Monte, mar y un cielo sin luces de ciudad.",
      items: ["La playa, a la hora azul", "El cielo sin luces de ciudad", "Hojas del monte, a la sombra"],
    },
    pets: {
      alt: "Un perro descansando en el sillón de una cabaña",
      maxLabel: "mascotas por cabaña",
      feeLabel: "cargo único de limpieza",
      perStay: "por estadía",
      cta: "Reservar con mascota",
    },
    location: {
      mapTitle: "Mapa de Calma La Pedrera en Google Maps",
      mapNote: "Vista aproximada de la zona.",
      open: "Abrir en Google Maps",
      sedesTitle: "Las dos sedes",
    },
    footer: {
      sedes: "Sedes",
      contact: "Contacto",
      explore: "En esta página",
      top: "Volver arriba",
      newTab: "(se abre en otra pestaña)",
    },
  },
  en: {
    sedes: {
      tabsLabel: "Choose a location",
      landscape: "Setting",
      where: "Where",
      cabins: "Cabins",
      apart: "1 km · 3 min",
      alt: {
        pedrera: "Wooden signpost in the forest pointing to the Agua, Tierra, Aire and Calma paths",
        sansebastian: "Dirt road between tall eucalyptus trees in San Sebastián de La Pedrera",
      },
    },
    cabins: {
      pickLabel: "Choose a cabin",
      from: "from",
      stageAlt: (name, kind, sede) => `${name} cabin: ${kind.toLowerCase()} in ${sede}`,
      insideTitle: "Inside",
      insideLead: "Swipe to walk through a cabin.",
      insideScroller: "Photos of the cabin interiors. Swipe or use the arrows to see more.",
      prev: "Previous photo",
      next: "Next photo",
      inside: [
        "The living room by the big window",
        "The loft bed",
        "The bathroom, all in wood",
        "Snacks by the wood stove",
        "The stove lit at night",
        "The living room in daylight",
      ],
    },
    entorno: {
      title: "Forest by day, sky by night",
      lead: "Woodland, sea and a sky without city lights.",
      items: ["The beach at blue hour", "A sky without city lights", "Leaves in the shade of the woods"],
    },
    pets: {
      alt: "A dog resting on the sofa of a cabin",
      maxLabel: "pets per cabin",
      feeLabel: "one-off cleaning fee",
      perStay: "per stay",
      cta: "Book with your pet",
    },
    location: {
      mapTitle: "Map of Calma La Pedrera on Google Maps",
      mapNote: "Approximate view of the area.",
      open: "Open in Google Maps",
      sedesTitle: "The two locations",
    },
    footer: {
      sedes: "Locations",
      contact: "Contact",
      explore: "On this page",
      top: "Back to top",
      newTab: "(opens in a new tab)",
    },
  },
  pt: {
    sedes: {
      tabsLabel: "Escolha uma sede",
      landscape: "Paisagem",
      where: "Onde",
      cabins: "Cabanas",
      apart: "1 km · 3 min",
      alt: {
        pedrera: "Placa de madeira na mata indicando as trilhas Agua, Tierra, Aire e Calma",
        sansebastian: "Estrada de terra entre eucaliptos altos em San Sebastián de La Pedrera",
      },
    },
    cabins: {
      pickLabel: "Escolha uma cabana",
      from: "a partir de",
      stageAlt: (name, kind, sede) => `Cabana ${name}: ${kind.toLowerCase()} em ${sede}`,
      insideTitle: "Por dentro",
      insideLead: "Deslize para percorrer uma cabana.",
      insideScroller: "Fotos do interior das cabanas. Deslize ou use as setas para ver mais.",
      prev: "Foto anterior",
      next: "Próxima foto",
      inside: [
        "A sala diante da janela grande",
        "A cama no mezanino",
        "O banheiro, todo em madeira",
        "Petiscos perto da lareira",
        "A lareira acesa, à noite",
        "A sala com luz do dia",
      ],
    },
    entorno: {
      title: "Mata de dia, céu de noite",
      lead: "Mata, mar e um céu sem luzes da cidade.",
      items: ["A praia na hora azul", "O céu sem luzes da cidade", "Folhas da mata, na sombra"],
    },
    pets: {
      alt: "Um cachorro descansando no sofá de uma cabana",
      maxLabel: "pets por cabana",
      feeLabel: "taxa única de limpeza",
      perStay: "por estadia",
      cta: "Reservar com pet",
    },
    location: {
      mapTitle: "Mapa da Calma La Pedrera no Google Maps",
      mapNote: "Vista aproximada da região.",
      open: "Abrir no Google Maps",
      sedesTitle: "As duas sedes",
    },
    footer: {
      sedes: "Sedes",
      contact: "Contato",
      explore: "Nesta página",
      top: "Voltar ao topo",
      newTab: "(abre em outra aba)",
    },
  },
};
