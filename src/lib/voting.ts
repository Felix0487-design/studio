export type VotingOption = {
  id: string;
  name: string;
  description: string;
};

export const votingOptions: VotingOption[] = [
  { 
    id: 'sacedon', 
    name: 'Opción A: Fin de Semana en Sacedón', 
    description: 'Plan General: Ir a Sacedón, hospedarnos en el Hostal Plaza, cenar y tomar copas en el pueblo. Alojamiento: Habitación para dos por 40,00€ el 23-09-2025. Pendiente de confirmar antes del 19-12-2025. Actividades: Rutas ligeras por el entorno (Caras de Buendía, mirador de Alocén).' 
  },
  { 
    id: 'taberna', 
    name: 'Opción B: LA TABERNA, Torres de la Alameda', 
    description: 'Se come muy bien, y se paga. Posibilidad de mesa redonda con reserva.' 
  },
  { 
    id: 'bife', 
    name: 'Opción B: EL BIFE, Arganda', 
    description: 'Ya conocido por algunos, se come bien. También con opción de mesa redonda.' 
  },
  { 
    id: 'quinta', 
    name: 'Opción B: QUINTA SAN ANTONIO, Velilla', 
    description: 'Ya hemos comido aquí antes, mesa redonda asegurada.' 
  },
];

export type VoteCounts = {
  [key: string]: number;
};
