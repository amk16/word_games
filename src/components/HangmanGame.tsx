import React, { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { recordGameWin } from '../lib/gameStats'
import { fetchSingleRandomVictoryImage, type BackendImage } from '../lib/api'

interface HangmanGameProps {
  onBack: () => void
  onShowRewards?: (gameName: string) => void
}

const WORD_LIST = [
  'JAVASCRIPT', 'COMPUTER', 'PROGRAMMING', 'ALGORITHM', 'FUNCTION',
  'VARIABLE', 'ELEMENT', 'KEYBOARD', 'MONITOR', 'SOFTWARE',
  'HARDWARE', 'NETWORK', 'DATABASE', 'WEBSITE', 'BROWSER',
  'FRAMEWORK', 'LIBRARY', 'PACKAGE', 'COMPONENT', 'INTERFACE',
  'DEVELOPER', 'ENGINEER', 'DESIGNER', 'CREATIVE', 'SOLUTION',
  'PROBLEM', 'CHALLENGE', 'PROJECT', 'SYSTEM', 'PROCESS'
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const HANGMAN_STAGES = [
  '', // 0 wrong guesses
  '  |\n  |\n  |\n  |\n__|', // 1
  '  +---+\n  |   |\n      |\n      |\n      |\n______|', // 2
  '  +---+\n  |   |\n  O   |\n      |\n      |\n______|', // 3
  '  +---+\n  |   |\n  O   |\n  |   |\n      |\n______|', // 4
  '  +---+\n  |   |\n  O   |\n /|   |\n      |\n______|', // 5
  '  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n______|', // 6
  '  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n______|', // 7
  '  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n______|'  // 8 - game over
]

type LetterStatus = 'correct' | 'incorrect' | 'unused'

const HangmanGame: React.FC<HangmanGameProps> = ({ onBack, onShowRewards }) => {
  const [targetWord, setTargetWord] = useState('')
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [incorrectGuesses, setIncorrectGuesses] = useState(0)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [victoryImage, setVictoryImage] = useState<BackendImage | null>(null)
  const [loadingVictoryImage, setLoadingVictoryImage] = useState(false)

  const initializeGame = useCallback(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    setTargetWord(randomWord)
    setGuessedLetters(new Set())
    setIncorrectGuesses(0)
    setGameStatus('playing')
    setVictoryImage(null)
    setLoadingVictoryImage(false)
  }, [])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const handleLetterGuess = (letter: string) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return

    const newGuessedLetters = new Set(guessedLetters)
    newGuessedLetters.add(letter)
    setGuessedLetters(newGuessedLetters)

    if (!targetWord.includes(letter)) {
      const newIncorrectGuesses = incorrectGuesses + 1
      setIncorrectGuesses(newIncorrectGuesses)
      
      if (newIncorrectGuesses >= 8) {
        setGameStatus('lost')
      }
    }
  }

  useEffect(() => {
    if (targetWord && guessedLetters.size > 0) {
      const hasWon = targetWord.split('').every(letter => guessedLetters.has(letter))
      if (hasWon && gameStatus === 'playing') {
        setGameStatus('won')
        recordGameWin('hangman')
        
        // Fetch a victory image
        setLoadingVictoryImage(true)
        fetchSingleRandomVictoryImage()
          .then(image => {
            setVictoryImage(image)
            setLoadingVictoryImage(false)
          })
          .catch(error => {
            console.error('Failed to fetch victory image:', error)
            setLoadingVictoryImage(false)
          })
      }
    }
  }, [guessedLetters, targetWord, gameStatus])

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase()
      if (/^[A-Z]$/.test(key)) {
        handleLetterGuess(key)
      }
    }

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [guessedLetters, gameStatus])

  const getLetterStatus = (letter: string): LetterStatus => {
    if (!guessedLetters.has(letter)) return 'unused'
    return targetWord.includes(letter) ? 'correct' : 'incorrect'
  }

  const getLetterStyle = (letter: string) => {
    const status = getLetterStatus(letter)
    let baseStyle = 'w-10 h-10 sm:w-12 sm:h-12 rounded font-bold text-sm transition-colors duration-200 touch-manipulation '
    
    switch (status) {
      case 'correct':
        return baseStyle + 'bg-green-500 text-white'
      case 'incorrect':
        return baseStyle + 'bg-red-500 text-white'
      default:
        return baseStyle + 'bg-gray-300 text-black hover:bg-gray-200'
    }
  }

  const displayWord = () => {
    return targetWord
      .split('')
      .map(letter => guessedLetters.has(letter) ? letter : '_')
      .join(' ')
  }

  const renderHangman = () => {
    return (
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-600 mb-4 sm:mb-6">
        <pre className="text-white font-mono text-xs sm:text-sm whitespace-pre-wrap text-center">
          {HANGMAN_STAGES[incorrectGuesses]}
        </pre>
      </div>
    )
  }

  const renderAlphabet = () => {
    const rows = [
      ALPHABET.slice(0, 9),   // A-I
      ALPHABET.slice(9, 18),  // J-R  
      ALPHABET.slice(18, 26)  // S-Z
    ]

    return (
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2">
            {row.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterGuess(letter)}
                className={getLetterStyle(letter)}
                disabled={gameStatus !== 'playing' || guessedLetters.has(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={onBack}
            className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Hangman</h1>
          <button
            onClick={initializeGame}
            className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        {/* Game Status */}
        {gameStatus !== 'playing' && (
          <div className="text-center mb-6">
            <div className={`text-lg sm:text-xl font-bold ${gameStatus === 'won' ? 'text-green-400' : 'text-red-400'}`}>
              {gameStatus === 'won' ? 'Congratulations!' : 'Game Over!'}
            </div>
            <div className="text-gray-300 mt-2">
              The word was: <span className="font-bold text-white">{targetWord}</span>
            </div>
            
            {/* Victory Image */}
            {gameStatus === 'won' && (
              <div className="mt-4 mb-4">
                {loadingVictoryImage ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mb-2"></div>
                    <p className="text-gray-400 text-sm">Loading your victory reward...</p>
                  </div>
                ) : victoryImage ? (
                  <div className="bg-gray-800 rounded-lg p-4 max-w-sm mx-auto">
                    <img
                      src={victoryImage.url}
                      alt={victoryImage.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                    <div className="text-center">
                      <h3 className="text-white font-medium text-sm mb-1">{victoryImage.title}</h3>
                      {victoryImage.source && (
                        <p className="text-gray-400 text-xs">via {victoryImage.source}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-4 max-w-sm mx-auto">
                    <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                      <Trophy className="text-yellow-400" size={48} />
                    </div>
                    <p className="text-center text-gray-400 text-sm">Your victory deserves celebration!</p>
                  </div>
                )}
              </div>
            )}
            
            {gameStatus === 'won' && onShowRewards && (
              <button
                onClick={() => onShowRewards('Hangman')}
                className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Trophy size={20} />
                View Full Victory Gallery!
              </button>
            )}
          </div>
        )}

        {/* Hangman Drawing */}
        {renderHangman()}

        {/* Word Display */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wider">
            {displayWord()}
          </div>
          <div className="text-gray-400 mt-2 text-sm sm:text-base">
            Wrong guesses: {incorrectGuesses}/8
          </div>
        </div>

        {/* Alphabet Keyboard */}
        {renderAlphabet()}

        {/* Instructions */}
        {gameStatus === 'playing' && guessedLetters.size === 0 && (
          <div className="mt-6 sm:mt-8 text-center text-gray-400 text-sm">
            <p>Guess the word one letter at a time</p>
            <p className="mt-2">You have 8 wrong guesses before the game ends</p>
            <div className="mt-3 space-y-1">
              <p className="flex items-center justify-center">
                <span className="inline-block w-4 h-4 bg-green-500 rounded mr-2"></span>
                Correct letter
              </p>
              <p className="flex items-center justify-center">
                <span className="inline-block w-4 h-4 bg-red-500 rounded mr-2"></span>
                Wrong letter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HangmanGame 