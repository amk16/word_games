import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, RotateCcw, Lightbulb, Trophy } from 'lucide-react'
import { recordGameWin } from '../lib/gameStats'

interface CrosswordGameProps {
  onBack?: () => void
  onShowRewards?: (gameName: string) => void
}

interface Clue {
  id: number
  text: string
  answer: string
  startRow: number
  startCol: number
  direction: 'across' | 'down'
  length: number
}

interface Cell {
  letter: string
  isBlocked: boolean
  clueNumber?: number
  belongsToClues: number[]
}

// Multiple crossword datasets - one for each day
const CROSSWORD_PUZZLES: Clue[][] = [
  // Puzzle 1 - Animals
  [
    // Across clues
    { id: 1, text: "Man's best friend", answer: "DOG", startRow: 0, startCol: 0, direction: 'across', length: 3 },
    { id: 4, text: "Feline pet", answer: "CAT", startRow: 2, startCol: 0, direction: 'across', length: 3 },
    { id: 6, text: "Flying mammal", answer: "BAT", startRow: 4, startCol: 2, direction: 'across', length: 3 },
    { id: 7, text: "Farm animal that says 'moo'", answer: "COW", startRow: 1, startCol: 4, direction: 'across', length: 3 },
    { id: 8, text: "Ocean predator with fins", answer: "SHARK", startRow: 3, startCol: 1, direction: 'across', length: 5 },
    
    // Down clues  
    { id: 2, text: "Frozen water", answer: "ICE", startRow: 0, startCol: 1, direction: 'down', length: 3 },
    { id: 3, text: "Large African animal with trunk", answer: "ELEPHANT", startRow: 0, startCol: 2, direction: 'down', length: 8 },
    { id: 5, text: "King of the jungle", answer: "LION", startRow: 2, startCol: 2, direction: 'down', length: 4 },
    { id: 9, text: "Buzzing insect", answer: "BEE", startRow: 1, startCol: 6, direction: 'down', length: 3 }
  ],

  // Puzzle 2 - Food & Cooking
  [
    // Across clues
    { id: 1, text: "Italian pasta dish", answer: "PIZZA", startRow: 0, startCol: 0, direction: 'across', length: 5 },
    { id: 6, text: "Morning meal", answer: "BREAKFAST", startRow: 2, startCol: 0, direction: 'across', length: 9 },
    { id: 7, text: "Sweet dessert", answer: "CAKE", startRow: 4, startCol: 2, direction: 'across', length: 4 },
    { id: 8, text: "Citrus fruit", answer: "ORANGE", startRow: 6, startCol: 0, direction: 'across', length: 6 },
    
    // Down clues
    { id: 2, text: "Round fruit", answer: "APPLE", startRow: 0, startCol: 1, direction: 'down', length: 5 },
    { id: 3, text: "Liquid for cooking", answer: "OIL", startRow: 0, startCol: 2, direction: 'down', length: 3 },
    { id: 4, text: "Yellow dairy product", answer: "CHEESE", startRow: 0, startCol: 3, direction: 'down', length: 6 },
    { id: 5, text: "Hot beverage", answer: "TEA", startRow: 0, startCol: 4, direction: 'down', length: 3 },
    { id: 9, text: "Breakfast grain", answer: "RICE", startRow: 2, startCol: 7, direction: 'down', length: 4 }
  ],

  // Puzzle 3 - Nature & Weather
  [
    // Across clues
    { id: 1, text: "Bright star in our solar system", answer: "SUN", startRow: 0, startCol: 0, direction: 'across', length: 3 },
    { id: 4, text: "Tall woody plant", answer: "TREE", startRow: 2, startCol: 0, direction: 'across', length: 4 },
    { id: 6, text: "Water from clouds", answer: "RAIN", startRow: 4, startCol: 1, direction: 'across', length: 4 },
    { id: 7, text: "Colorful arc in sky", answer: "RAINBOW", startRow: 1, startCol: 4, direction: 'across', length: 7 },
    { id: 8, text: "Cold season", answer: "WINTER", startRow: 6, startCol: 0, direction: 'across', length: 6 },
    
    // Down clues
    { id: 2, text: "Fluffy white formations", answer: "CLOUDS", startRow: 0, startCol: 1, direction: 'down', length: 6 },
    { id: 3, text: "Moving air", answer: "WIND", startRow: 0, startCol: 2, direction: 'down', length: 4 },
    { id: 5, text: "Night light", answer: "MOON", startRow: 2, startCol: 3, direction: 'down', length: 4 },
    { id: 9, text: "Frozen precipitation", answer: "SNOW", startRow: 1, startCol: 9, direction: 'down', length: 4 }
  ],

  // Puzzle 4 - Sports & Games
  [
    // Across clues
    { id: 1, text: "Round sports ball", answer: "SOCCER", startRow: 0, startCol: 0, direction: 'across', length: 6 },
    { id: 7, text: "Racket sport", answer: "TENNIS", startRow: 2, startCol: 0, direction: 'across', length: 6 },
    { id: 8, text: "Hoop game", answer: "BASKETBALL", startRow: 4, startCol: 0, direction: 'across', length: 10 },
    { id: 9, text: "Water sport", answer: "SWIM", startRow: 6, startCol: 2, direction: 'across', length: 4 },
    
    // Down clues
    { id: 2, text: "Team with 11 players", answer: "SQUAD", startRow: 0, startCol: 1, direction: 'down', length: 5 },
    { id: 3, text: "Goal keeper", answer: "GOALIE", startRow: 0, startCol: 2, direction: 'down', length: 6 },
    { id: 4, text: "Game official", answer: "REFEREE", startRow: 0, startCol: 3, direction: 'down', length: 7 },
    { id: 5, text: "Playing field", answer: "COURT", startRow: 0, startCol: 4, direction: 'down', length: 5 },
    { id: 6, text: "Score point", answer: "GOAL", startRow: 0, startCol: 5, direction: 'down', length: 4 }
  ],

  // Puzzle 5 - Technology
  [
    // Across clues
    { id: 1, text: "Personal computer", answer: "LAPTOP", startRow: 0, startCol: 0, direction: 'across', length: 6 },
    { id: 7, text: "Communication device", answer: "PHONE", startRow: 2, startCol: 0, direction: 'across', length: 5 },
    { id: 8, text: "Global network", answer: "INTERNET", startRow: 4, startCol: 0, direction: 'across', length: 8 },
    { id: 9, text: "Digital message", answer: "EMAIL", startRow: 6, startCol: 2, direction: 'across', length: 5 },
    
    // Down clues
    { id: 2, text: "Input device", answer: "KEYBOARD", startRow: 0, startCol: 1, direction: 'down', length: 8 },
    { id: 3, text: "Pointing device", answer: "MOUSE", startRow: 0, startCol: 2, direction: 'down', length: 5 },
    { id: 4, text: "Display screen", answer: "MONITOR", startRow: 0, startCol: 3, direction: 'down', length: 7 },
    { id: 5, text: "Wireless connection", answer: "WIFI", startRow: 0, startCol: 4, direction: 'down', length: 4 },
    { id: 6, text: "Portable storage", answer: "USB", startRow: 0, startCol: 5, direction: 'down', length: 3 }
  ],

  // Puzzle 6 - Colors & Art
  [
    // Across clues
    { id: 1, text: "Primary color of blood", answer: "RED", startRow: 0, startCol: 0, direction: 'across', length: 3 },
    { id: 4, text: "Color of grass", answer: "GREEN", startRow: 2, startCol: 0, direction: 'across', length: 5 },
    { id: 6, text: "Color of sky", answer: "BLUE", startRow: 4, startCol: 1, direction: 'across', length: 4 },
    { id: 7, text: "Bright color", answer: "YELLOW", startRow: 1, startCol: 3, direction: 'across', length: 6 },
    { id: 8, text: "Dark color", answer: "BLACK", startRow: 6, startCol: 0, direction: 'across', length: 5 },
    
    // Down clues
    { id: 2, text: "Artist's tool", answer: "BRUSH", startRow: 0, startCol: 1, direction: 'down', length: 5 },
    { id: 3, text: "Coloring medium", answer: "PAINT", startRow: 0, startCol: 2, direction: 'down', length: 5 },
    { id: 5, text: "Drawing surface", answer: "CANVAS", startRow: 2, startCol: 4, direction: 'down', length: 6 },
    { id: 9, text: "Light color", answer: "WHITE", startRow: 1, startCol: 8, direction: 'down', length: 5 }
  ],

  // Puzzle 7 - Transportation
  [
    // Across clues
    { id: 1, text: "Four-wheeled vehicle", answer: "CAR", startRow: 0, startCol: 0, direction: 'across', length: 3 },
    { id: 4, text: "Flying vehicle", answer: "PLANE", startRow: 2, startCol: 0, direction: 'across', length: 5 },
    { id: 6, text: "Two-wheeled vehicle", answer: "BIKE", startRow: 4, startCol: 1, direction: 'across', length: 4 },
    { id: 7, text: "Public transport", answer: "BUS", startRow: 1, startCol: 4, direction: 'across', length: 3 },
    { id: 8, text: "Water vessel", answer: "SHIP", startRow: 6, startCol: 0, direction: 'across', length: 4 },
    
    // Down clues
    { id: 2, text: "Rail transport", answer: "TRAIN", startRow: 0, startCol: 1, direction: 'down', length: 5 },
    { id: 3, text: "City transport", answer: "TAXI", startRow: 0, startCol: 2, direction: 'down', length: 4 },
    { id: 5, text: "Underground transport", answer: "SUBWAY", startRow: 2, startCol: 4, direction: 'down', length: 6 },
    { id: 9, text: "Helicopter blade", answer: "ROTOR", startRow: 1, startCol: 6, direction: 'down', length: 5 }
  ]
]

// Function to get the current puzzle based on date
const getCurrentPuzzle = (): Clue[] => {
  const today = new Date()
  const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24))
  const puzzleIndex = daysSinceEpoch % CROSSWORD_PUZZLES.length
  return CROSSWORD_PUZZLES[puzzleIndex]
}

// Function to get puzzle theme name
const getPuzzleTheme = (): string => {
  const today = new Date()
  const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24))
  const puzzleIndex = daysSinceEpoch % CROSSWORD_PUZZLES.length
  
  const themes = [
    "Animals",
    "Food & Cooking", 
    "Nature & Weather",
    "Sports & Games",
    "Technology",
    "Colors & Art",
    "Transportation"
  ]
  
  return themes[puzzleIndex]
}

const GRID_SIZE = 12 // Increased grid size to accommodate larger puzzles

const CrosswordGame: React.FC<CrosswordGameProps> = ({ onBack, onShowRewards }) => {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [userAnswers, setUserAnswers] = useState<string[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [selectedClue, setSelectedClue] = useState<number | null>(null)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing')
  const [showHint, setShowHint] = useState<Record<number, boolean>>({})
  const [currentPuzzle, setCurrentPuzzle] = useState<Clue[]>([])
  const [puzzleTheme, setPuzzleTheme] = useState<string>("")
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([])

  const initializeGame = useCallback(() => {
    // Get current puzzle based on date
    const puzzle = getCurrentPuzzle()
    const theme = getPuzzleTheme()
    setCurrentPuzzle(puzzle)
    setPuzzleTheme(theme)

    // Create empty grid with all blocked cells
    const newGrid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        letter: '',
        isBlocked: true,
        belongsToClues: []
      }))
    )

    const newUserAnswers: string[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill('')
    )

    // Initialize input refs
    inputRefs.current = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null)
    )

    // Place clues in grid
    puzzle.forEach(clue => {
      for (let i = 0; i < clue.length; i++) {
        const row = clue.direction === 'across' ? clue.startRow : clue.startRow + i
        const col = clue.direction === 'across' ? clue.startCol + i : clue.startCol
        
        if (row < GRID_SIZE && col < GRID_SIZE) {
          // Unblock the cell and set properties
          newGrid[row][col] = {
            letter: clue.answer[i],
            isBlocked: false,
            clueNumber: i === 0 ? clue.id : newGrid[row][col].clueNumber,
            belongsToClues: [...(newGrid[row][col].belongsToClues || []), clue.id]
          }
        }
      }
    })

    setGrid(newGrid)
    setUserAnswers(newUserAnswers)
    setSelectedCell(null)
    setSelectedClue(null)
    setGameStatus('playing')
    setShowHint({})
  }, [])

  useEffect(() => {
    initializeGame()
    
    // Set up interval to check for new day and refresh puzzle
    const checkForNewDay = () => {
      const puzzle = getCurrentPuzzle()
      // const theme = getPuzzleTheme()
      
      // If puzzle has changed (new day), reinitialize
      if (JSON.stringify(puzzle) !== JSON.stringify(currentPuzzle)) {
        initializeGame()
      }
    }

    // Check every minute for a new day
    const interval = setInterval(checkForNewDay, 60000)
    
    return () => clearInterval(interval)
  }, [initializeGame, currentPuzzle])

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isBlocked) return
    
    setSelectedCell({ row, col })
    
    // Find a clue that this cell belongs to
    const belongsToClues = grid[row][col].belongsToClues
    if (belongsToClues.length > 0) {
      // If multiple clues, prefer the currently selected one, or pick the first
      const clueToSelect = belongsToClues.includes(selectedClue || 0) 
        ? selectedClue 
        : belongsToClues[0]
      setSelectedClue(clueToSelect)
    }
  }

  const handleCellInput = (row: number, col: number, value: string) => {
    if (grid[row][col].isBlocked) return
    
    const newUserAnswers = [...userAnswers]
    newUserAnswers[row][col] = value.toUpperCase()
    setUserAnswers(newUserAnswers)
    
    // Auto-advance to next cell if a letter was entered
    if (value && selectedClue) {
      const currentClue = currentPuzzle.find(clue => clue.id === selectedClue)
      if (currentClue) {
        let nextRow, nextCol
        
        if (currentClue.direction === 'across') {
          nextRow = row
          nextCol = col + 1
        } else {
          nextRow = row + 1
          nextCol = col
        }
        
        // Check if next cell is valid and part of the same clue
        if (nextRow < GRID_SIZE && nextCol < GRID_SIZE && 
            !grid[nextRow][nextCol].isBlocked && 
            grid[nextRow][nextCol].belongsToClues.includes(selectedClue)) {
          setSelectedCell({ row: nextRow, col: nextCol })
          
          // Focus the next input field
          setTimeout(() => {
            const nextInput = inputRefs.current[nextRow]?.[nextCol]
            if (nextInput) {
              nextInput.focus()
            }
          }, 0)
        }
      }
    }
    
    // Check if game is won
    checkGameWon(newUserAnswers)
  }

  const checkGameWon = (answers: string[][]) => {
    const isComplete = currentPuzzle.every(clue => {
      for (let i = 0; i < clue.length; i++) {
        const row = clue.direction === 'across' ? clue.startRow : clue.startRow + i
        const col = clue.direction === 'across' ? clue.startCol + i : clue.startCol
        
        if (answers[row][col] !== clue.answer[i]) {
          return false
        }
      }
      return true
    })
    
    if (isComplete) {
      setGameStatus('won')
      // Record the win when player successfully completes the puzzle
      recordGameWin('crossword')
    }
  }

  const toggleHint = (clueId: number) => {
    setShowHint(prev => ({
      ...prev,
      [clueId]: !prev[clueId]
    }))
  }

  const handleClueClick = (clueId: number) => {
    const clue = currentPuzzle.find(c => c.id === clueId)
    if (clue) {
      setSelectedClue(clueId)
      setSelectedCell({ row: clue.startRow, col: clue.startCol })
      
      // Focus the first cell of the clue
      setTimeout(() => {
        const input = inputRefs.current[clue.startRow]?.[clue.startCol]
        if (input) {
          input.focus()
        }
      }, 0)
    }
  }

  const getCellStyle = (row: number, col: number) => {
    const cell = grid[row][col]
    const isSelected = selectedCell?.row === row && selectedCell?.col === col
    const isInSelectedClue = selectedClue && cell.belongsToClues.includes(selectedClue)
    
    if (cell.isBlocked) {
      return 'bg-gray-800 border-gray-700'
    }
    
    let style = 'bg-white border-gray-400 text-black hover:bg-gray-50 '
    
    if (isSelected) {
      style += 'ring-2 ring-blue-400 '
    } else if (isInSelectedClue) {
      style += 'bg-blue-50 '
    }
    
    return style
  }

  const renderGrid = () => {
    return grid.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`w-8 h-8 sm:w-10 sm:h-10 border border-gray-400 flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer relative touch-manipulation ${getCellStyle(rowIndex, colIndex)}`}
            onClick={() => handleCellClick(rowIndex, colIndex)}
          >
            {cell.clueNumber && (
              <span className="absolute top-0 left-0.5 text-xs text-blue-600 font-bold leading-none">
                {cell.clueNumber}
              </span>
            )}
            {!cell.isBlocked && (
              <input
                ref={(el) => {
                  if (!inputRefs.current[rowIndex]) {
                    inputRefs.current[rowIndex] = []
                  }
                  inputRefs.current[rowIndex][colIndex] = el
                }}
                type="text"
                maxLength={1}
                value={userAnswers[rowIndex][colIndex] || ''}
                onChange={(e) => handleCellInput(rowIndex, colIndex, e.target.value)}
                className="w-full h-full text-center border-none outline-none bg-transparent text-black font-bold text-xs sm:text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        ))}
      </div>
    ))
  }

  const acrossClues = currentPuzzle.filter(clue => clue.direction === 'across')
  const downClues = currentPuzzle.filter(clue => clue.direction === 'down')

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Daily Crossword</h1>
            <p className="text-blue-400 text-base sm:text-lg">{puzzleTheme}</p>
            <p className="text-gray-400 text-xs sm:text-sm">New puzzle every 24 hours!</p>
          </div>
          <button
            onClick={initializeGame}
            className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
            title="Reset puzzle"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        {/* Game Status */}
        {gameStatus === 'won' && (
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-green-400 mb-2">
              🎉 Congratulations! 🎉
            </div>
            <div className="text-gray-300 mb-4">
              You've completed the crossword puzzle!
            </div>
            {onShowRewards && (
              <button
                onClick={() => onShowRewards('Crossword')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Trophy size={20} />
                Claim Victory Rewards!
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-8">
          {/* Game Grid */}
          <div className="xl:col-span-2 flex justify-center">
            <div className="inline-block border-2 border-gray-600 bg-gray-800 p-2 sm:p-4 rounded-lg overflow-x-auto">
              <div className="flex flex-col min-w-max">
                {renderGrid()}
              </div>
            </div>
          </div>

          {/* Clues */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Across</h3>
              <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto">
                {acrossClues.map(clue => (
                  <div 
                    key={clue.id} 
                    className={`bg-gray-800 rounded-lg p-3 cursor-pointer transition-colors touch-manipulation ${
                      selectedClue === clue.id ? 'ring-2 ring-blue-400' : 'hover:bg-gray-700'
                    }`}
                    onClick={() => handleClueClick(clue.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="text-blue-400 font-bold text-sm sm:text-base">{clue.id}. </span>
                        <span className="text-white text-sm sm:text-base">{clue.text}</span>
                        <span className="text-gray-400 text-xs sm:text-sm ml-2">({clue.length} letters)</span>
                        {showHint[clue.id] && (
                          <div className="mt-2 text-green-400 text-sm font-mono">
                            {clue.answer}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleHint(clue.id)
                        }}
                        className="p-1 text-yellow-400 hover:bg-gray-600 rounded transition-colors ml-2 touch-manipulation"
                        title="Show hint"
                      >
                        <Lightbulb size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Down</h3>
              <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto">
                {downClues.map(clue => (
                  <div 
                    key={clue.id} 
                    className={`bg-gray-800 rounded-lg p-3 cursor-pointer transition-colors touch-manipulation ${
                      selectedClue === clue.id ? 'ring-2 ring-blue-400' : 'hover:bg-gray-700'
                    }`}
                    onClick={() => handleClueClick(clue.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="text-blue-400 font-bold text-sm sm:text-base">{clue.id}. </span>
                        <span className="text-white text-sm sm:text-base">{clue.text}</span>
                        <span className="text-gray-400 text-xs sm:text-sm ml-2">({clue.length} letters)</span>
                        {showHint[clue.id] && (
                          <div className="mt-2 text-green-400 text-sm font-mono">
                            {clue.answer}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleHint(clue.id)
                        }}
                        className="p-1 text-yellow-400 hover:bg-gray-600 rounded transition-colors ml-2 touch-manipulation"
                        title="Show hint"
                      >
                        <Lightbulb size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {gameStatus === 'playing' && (
          <div className="mt-6 sm:mt-8 text-center text-gray-400 text-xs sm:text-sm space-y-2">
            <p>Click on a cell or clue to select it and start typing</p>
            <p>Use the lightbulb icons to reveal hints for each clue</p>
            <p>Letters will auto-advance to the next cell in the word</p>
            <p className="text-blue-400">🌟 Come back tomorrow for a new themed puzzle!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CrosswordGame