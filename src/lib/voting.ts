export type VotingOption = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  imageHint?: string;
};

export const votingOptions: VotingOption[] = [
  { 
    id: 'sacedon', 
    name: 'Opción A: Fin de Semana en Sacedón', 
    description: 'Nos vamos de casa rural a Sacedón. Incluye alojamiento, cena y rutas por la naturaleza.',
    imageUrl: "https://picsum.photos/seed/sacedon/600/400",
    imageHint: "rural landscape"
  },
  { 
    id: 'taberna', 
    name: 'Opción B: LA TABERNA, Torres de la Alameda', 
    description: 'Restaurante de comida tradicional con buena fama. Perfecto para una comida de grupo.',
    imageUrl: "https://picsum.photos/seed/taberna/600/400",
    imageHint: "traditional restaurant"
  },
  { 
    id: 'bife', 
    name: 'Opción B: EL BIFE, Arganda', 
    description: 'Ideal para amantes de la carne. Un clásico que no falla para una buena comilona.',
    imageUrl: "https://picsum.photos/seed/bife/600/400",
    imageHint: "steakhouse grill"
  },
  { 
    id: 'quinta', 
    name: 'Opción B: QUINTA SAN ANTONIO, Velilla', 
    description: 'Un sitio que ya conocemos, con un ambiente agradable y con mesa redonda asegurada.',
    imageUrl: "https://picsum.photos/seed/quinta/600/400",
    imageHint: "elegant restaurant"
  },
];

export type VoteCounts = {
  [key: string]: number;
};
