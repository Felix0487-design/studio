"use client";

export const USERS = [
  'Ángel', 'Félix', 'Goyo', 'Toñi', 'Luis', 'José', 'Pepe', 'Lucio', 'Antonio', 'Virgilio'
];

export const SUPER_SECRET_PASSWORD = 'navidad 2025';

export const SUPER_USER = 'jubilado';
export const SUPER_USER_PASSWORD = 'navidad1960';

const VOTE_STORAGE_KEY = 'navidad_votes';
const USER_STORAGE_KEY = 'navidad_user';

// --- User Management ---

export const setCurrentUser = (user: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, user);
  }
};

export const getCurrentUser = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(USER_STORAGE_KEY);
  }
  return null;
};

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

// --- Vote Management ---

export const getVotes = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const votes = localStorage.getItem(VOTE_STORAGE_KEY);
    return votes ? JSON.parse(votes) : {};
  }
  return {};
};

export const saveVote = (user: string, optionId: string): Record<string, string> => {
  const votes = getVotes();
  votes[user] = optionId;
  if (typeof window !== 'undefined') {
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(votes));
  }
  return votes;
};

export const resetVotes = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(VOTE_STORAGE_KEY);
  }
};
