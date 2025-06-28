import React, { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { recordGameWin } from '../lib/gameStats'

interface WordleGameProps {
  onBack: () => void
  onShowRewards?: (gameName: string) => void
}

const WORD_LIST = [
  'ABOUT', 'OTHER', 'WHICH', 'THEIR', 'WOULD', 'THERE', 'COULD', 'FIRST',
  'AFTER', 'THESE', 'THINK', 'WHERE', 'BEING', 'EVERY', 'GREAT', 'MIGHT',
  'SHALL', 'STILL', 'THOSE', 'WHILE', 'STATE', 'NEVER', 'WORLD', 'GOING',
  'HOUSE', 'RIGHT', 'PLACE', 'FOUND', 'WATER', 'SOUND', 'LIGHT', 'PEACE',
  'ROUND', 'MUSIC', 'STORY', 'PLANT', 'FIELD', 'HEARD', 'POINT', 'STAND',
  'SMALL', 'BLACK', 'WHITE', 'VOICE', 'YOUNG', 'POWER', 'ORDER', 'FORCE'
]

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
]

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty'

interface Cell {
  letter: string
  status: LetterStatus
}

const WordleGame: React.FC<WordleGameProps> = ({ onBack, onShowRewards }) => {
  const [targetWord, setTargetWord] = useState('')
  const [currentGuess, setCurrentGuess] = useState('')
  const [guesses, setGuesses] = useState<Cell[][]>([])
  const [currentRow, setCurrentRow] = useState(0)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [keyboardStatus, setKeyboardStatus] = useState<Record<string, LetterStatus>>({})

  const initializeGame = useCallback(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    setTargetWord(randomWord)
    setCurrentGuess('')
    setGuesses([])
    setCurrentRow(0)
    setGameStatus('playing')
    setKeyboardStatus({})
  }, [])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const evaluateGuess = (guess: string): Cell[] => {
    const result: Cell[] = []
    const targetLetters = targetWord.split('')
    const guessLetters = guess.split('')
    
    // First pass: mark correct positions
    const used = new Array(5).fill(false)
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        result[i] = { letter: guessLetters[i], status: 'correct' }
        used[i] = true
      } else {
        result[i] = { letter: guessLetters[i], status: 'absent' }
      }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
      if (result[i].status === 'absent') {
        for (let j = 0; j < 5; j++) {
          if (!used[j] && guessLetters[i] === targetLetters[j]) {
            result[i].status = 'present'
            used[j] = true
            break
          }
        }
      }
    }
    
    return result
  }

  const updateKeyboardStatus = (guess: string, evaluation: Cell[]) => {
    const newKeyboardStatus = { ...keyboardStatus }
    
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i]
      const status = evaluation[i].status
      
      if (!newKeyboardStatus[letter] || 
          (newKeyboardStatus[letter] === 'absent' && status !== 'absent') ||
          (newKeyboardStatus[letter] === 'present' && status === 'correct')) {
        newKeyboardStatus[letter] = status
      }
    }
    
    setKeyboardStatus(newKeyboardStatus)
  }

  const submitGuess = () => {
    if (currentGuess.length !== 5) return
    
    const evaluation = evaluateGuess(currentGuess)
    const newGuesses = [...guesses, evaluation]
    setGuesses(newGuesses)
    updateKeyboardStatus(currentGuess, evaluation)
    
    if (currentGuess === targetWord) {
      setGameStatus('won')
      // Record the win when player successfully completes the game
      recordGameWin('wordle')
    } else if (currentRow === 5) {
      setGameStatus('lost')
    } else {
      setCurrentRow(currentRow + 1)
      setCurrentGuess('')
    }
  }

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return
    
    if (key === 'ENTER') {
      submitGuess()
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(currentGuess.slice(0, -1))
    } else if (key.length === 1 && currentGuess.length < 5) {
      setCurrentGuess(currentGuess + key.toUpperCase())
    }
  }

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase()
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        handleKeyPress(key)
      }
    }

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [currentGuess, gameStatus])

  const getCellStyle = (status: LetterStatus) => {
    switch (status) {
      case 'correct':
        return 'bg-green-500 border-green-500 text-white'
      case 'present':
        return 'bg-yellow-500 border-yellow-500 text-white'
      case 'absent':
        return 'bg-gray-600 border-gray-600 text-white'
      default:
        return 'bg-gray-800 border-gray-500 text-white'
    }
  }

  const getKeyStyle = (letter: string) => {
    const status = keyboardStatus[letter]
    let baseStyle = 'px-2 sm:px-3 py-3 sm:py-4 rounded font-bold text-xs sm:text-sm transition-colors duration-200 min-w-[32px] sm:min-w-[40px] touch-manipulation '
    
    switch (status) {
      case 'correct':
        return baseStyle + 'bg-green-500 text-white'
      case 'present':
        return baseStyle + 'bg-yellow-500 text-white'
      case 'absent':
        return baseStyle + 'bg-gray-600 text-white'
      default:
        return baseStyle + 'bg-gray-300 text-black hover:bg-gray-200'
    }
  }

  const renderGrid = () => {
    const grid = []
    
    for (let row = 0; row < 6; row++) {
      const rowCells = []
      
      for (let col = 0; col < 5; col++) {
        let cell: Cell = { letter: '', status: 'empty' }
        
        if (row < guesses.length) {
          cell = guesses[row][col]
        } else if (row === currentRow && col < currentGuess.length) {
          cell = { letter: currentGuess[col], status: 'empty' }
        }
        
        rowCells.push(
          <div
            key={`${row}-${col}`}
            className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-lg sm:text-xl font-bold ${getCellStyle(cell.status)}`}
          >
            {cell.letter}
          </div>
        )
      }
      
      grid.push(
        <div key={row} className="flex gap-1 sm:gap-2">
          {rowCells}
        </div>
      )
    }
    
    return grid
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Wordle</h1>
          <button
            onClick={initializeGame}
            className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        {/* Game Status */}
        {gameStatus !== 'playing' && (
          <div className="text-center mb-4 sm:mb-6">
            <div className={`text-lg sm:text-xl font-bold ${gameStatus === 'won' ? 'text-green-400' : 'text-red-400'}`}>
              {gameStatus === 'won' ? 'Congratulations!' : 'Game Over!'}
            </div>
            <div className="text-gray-300 mt-2 text-sm sm:text-base">
              The word was: <span className="font-bold text-white">{targetWord}</span>
            </div>
            {gameStatus === 'won' && onShowRewards && (
              <button
                onClick={() => onShowRewards('Wordle')}
                className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Trophy size={20} />
                Claim Victory Rewards!
              </button>
            )}
          </div>
        )}

        {/* Game Grid */}
        <div className="flex flex-col gap-1 sm:gap-2 mb-4 sm:mb-6 items-center">
          {renderGrid()}
        </div>

        {/* Keyboard */}
        <div className="space-y-1 sm:space-y-2">
          {KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`
                    ${getKeyStyle(key)}
                    ${key === 'ENTER' || key === 'BACKSPACE' ? 'px-3 sm:px-4' : 'px-2 sm:px-3'}
                    ${key === 'ENTER' || key === 'BACKSPACE' ? 'text-xs' : ''}
                  `}
                  disabled={gameStatus !== 'playing'}
                >
                  {key === 'BACKSPACE' ? '⌫' : key}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Instructions */}
        {gameStatus === 'playing' && guesses.length === 0 && (
          <div className="mt-6 sm:mt-8 text-center text-gray-400 text-sm">
            <p>Guess the 5-letter word in 6 tries</p>
            <div className="mt-3 space-y-1">
              <p className="flex items-center justify-center">
                <span className="inline-block w-4 h-4 bg-green-500 rounded mr-2"></span>
                Correct letter and position
              </p>
              <p className="flex items-center justify-center">
                <span className="inline-block w-4 h-4 bg-yellow-500 rounded mr-2"></span>
                Correct letter, wrong position
              </p>
              <p className="flex items-center justify-center">
                <span className="inline-block w-4 h-4 bg-gray-600 rounded mr-2"></span>
                Letter not in word
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WordleGame 