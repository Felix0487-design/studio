export type VotingOption = {
  id: string;
  name: string;
  description: string;
};

export const votingOptions: VotingOption[] = [
  { id: 'cordero', name: 'Cordero Asado', description: 'Tierno y jugoso cordero al horno, un clásico navideño.' },
  { id: 'marisco', name: 'Marisco', description: 'Una selección fresca de gambas, langostinos y otros frutos del mar.' },
  { id: 'cochinillo', name: 'Cochinillo', description: 'Crujiente por fuera, tierno por dentro, un manjar de Segovia.' },
  { id: 'pavo', name: 'Pavo Relleno', description: 'El tradicional pavo relleno de frutos secos y carne, jugoso y sabroso.' },
];

export type VoteCounts = {
  [key: string]: number;
};
