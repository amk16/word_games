// Game statistics management using localStorage
export interface GameStats {
  totalWins: number;
  wordleWins: number;
  hangmanWins: number;
  crosswordWins: number;
}

const STORAGE_KEY = 'gameStats';

// Load game statistics from localStorage
export const loadGameStats = (): GameStats => {
  try {
    const stats = localStorage.getItem(STORAGE_KEY);
    if (stats) {
      const parsed = JSON.parse(stats);
      return {
        totalWins: parsed.totalWins || 0,
        wordleWins: parsed.wordleWins || 0,
        hangmanWins: parsed.hangmanWins || 0,
        crosswordWins: parsed.crosswordWins || 0
      };
    }
  } catch (error) {
    console.error('Error loading game stats:', error);
  }
  return { totalWins: 0, wordleWins: 0, hangmanWins: 0, crosswordWins: 0 };
};

// Save game statistics to localStorage
export const saveGameStats = (stats: GameStats): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving game stats:', error);
  }
};

// Record a win for a specific game
export const recordGameWin = (gameName: 'wordle' | 'hangman' | 'crossword'): GameStats => {
  const currentStats = loadGameStats();
  const newStats = { ...currentStats };
  
  // Increment specific game wins
  switch (gameName) {
    case 'wordle':
      newStats.wordleWins++;
      break;
    case 'hangman':
      newStats.hangmanWins++;
      break;
    case 'crossword':
      newStats.crosswordWins++;
      break;
  }
  
  // Update total wins
  newStats.totalWins = newStats.wordleWins + newStats.hangmanWins + newStats.crosswordWins;
  
  // Save to localStorage
  saveGameStats(newStats);
  
  return newStats;
};

// Reset all game statistics
export const resetGameStats = (): GameStats => {
  const resetStats: GameStats = { totalWins: 0, wordleWins: 0, hangmanWins: 0, crosswordWins: 0 };
  saveGameStats(resetStats);
  return resetStats;
}; 