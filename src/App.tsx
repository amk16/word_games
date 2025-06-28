import { useState } from 'react'
import { BorderBeam } from './components/magicui/border-beam'
import WordleGame from './components/WordleGame'
import HangmanGame from './components/HangmanGame'
import CrosswordGame from './components/CrosswordGame'
import VictoryReward from './components/VictoryReward'
import { Grid3X3, Users, Hash, Trophy, Globe } from 'lucide-react'

const App = () => {
  const [currentGame, setCurrentGame] = useState<string | null>(null)
  const [showRewards, setShowRewards] = useState<{ show: boolean; gameName: string }>({ show: false, gameName: '' })

  const handleGameSelect = (game: string) => {
    setCurrentGame(game)
    setShowRewards({ show: false, gameName: '' })
  }

  const handleBackToHome = () => {
    setCurrentGame(null)
    setShowRewards({ show: false, gameName: '' })
  }

  const handleShowRewards = (gameName: string) => {
    setShowRewards({ show: true, gameName })
  }

  const handleWebsiteClick = () => {
    window.open('https://amk16.vercel.app', '_blank')
  }

  // Show victory rewards if requested
  if (showRewards.show) {
    return <VictoryReward onBack={handleBackToHome} gameName={showRewards.gameName} />
  }

  // Show the selected game
  if (currentGame === 'wordle') {
    return <WordleGame onBack={handleBackToHome} onShowRewards={handleShowRewards} />
  }

  if (currentGame === 'hangman') {
    return <HangmanGame onBack={handleBackToHome} onShowRewards={handleShowRewards} />
  }

  if (currentGame === 'crossword') {
    return <CrosswordGame onBack={handleBackToHome} onShowRewards={handleShowRewards} />
  }

  if (currentGame === 'victory-rewards') {
    return <VictoryReward onBack={handleBackToHome} gameName="Sample Game" />
  }

  // Show the main menu
  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 sm:mb-16 text-white tracking-tight">
          Sach Games
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-8 max-w-7xl mx-auto">
          {/* Card 1 - Wordle */}
          <div 
            className="relative overflow-hidden aspect-square w-full max-w-80 mx-auto cursor-pointer transform transition-transform hover:scale-105"
            onClick={() => handleGameSelect('wordle')}
          >
            <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-2xl h-full border border-gray-700 flex flex-col items-center justify-center text-center">
              <div className="mb-4 sm:mb-6">
                <Grid3X3 size={48} className="text-blue-400 mx-auto sm:w-16 sm:h-16" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white tracking-wide">Wordle</h2>
              <p className="text-gray-300 text-sm font-medium">
                Guess the 5-letter word
              </p>
            </div>
            <BorderBeam 
              size={100} 
              duration={8} 
              colorFrom="#3b82f6" 
              colorTo="#8b5cf6" 
            />
          </div>

          {/* Card 2 - Hangman */}
          <div 
            className="relative overflow-hidden aspect-square w-full max-w-80 mx-auto cursor-pointer transform transition-transform hover:scale-105"
            onClick={() => handleGameSelect('hangman')}
          >
            <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-2xl h-full border border-gray-700 flex flex-col items-center justify-center text-center">
              <div className="mb-4 sm:mb-6">
                <Users size={48} className="text-emerald-400 mx-auto sm:w-16 sm:h-16" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white tracking-wide">Hangman</h2>
              <p className="text-gray-300 text-sm font-medium">
                Save the stickman
              </p>
            </div>
            <BorderBeam 
              size={100} 
              duration={20} 
              delay={2}
              colorFrom="#10b981" 
              colorTo="#06b6d4" 
            />
          </div>

          {/* Card 3 - Crossword */}
          <div 
            className="relative overflow-hidden aspect-square w-full max-w-80 mx-auto cursor-pointer transform transition-transform hover:scale-105"
            onClick={() => handleGameSelect('crossword')}
          >
            <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-2xl h-full border border-gray-700 flex flex-col items-center justify-center text-center">
              <div className="mb-4 sm:mb-6">
                <Hash size={48} className="text-amber-400 mx-auto sm:w-16 sm:h-16" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white tracking-wide">Crossword</h2>
              <p className="text-gray-300 text-sm font-medium">
                Fill the grid puzzle
              </p>
            </div>
            <BorderBeam 
              size={100} 
              duration={10} 
              delay={4}
              colorFrom="#f59e0b" 
              colorTo="#ef4444" 
              
            />
          </div>

          {/* Card 4 - Victory Rewards */}
          <div 
            className="relative overflow-hidden aspect-square w-full max-w-80 mx-auto cursor-pointer transform transition-transform hover:scale-105"
            onClick={() => handleGameSelect('victory-rewards')}
          >
            <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-2xl h-full border border-gray-700 flex flex-col items-center justify-center text-center">
              <div className="mb-4 sm:mb-6">
                <Trophy size={48} className="text-yellow-400 mx-auto sm:w-16 sm:h-16" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white tracking-wide">Victory Rewards</h2>
              <p className="text-gray-300 text-sm font-medium">
                View your reward images
              </p>
            </div>
            <BorderBeam 
              size={100} 
              duration={15} 
              delay={1}
              colorFrom="#ffd700" 
              colorTo="#ff6b35" 
            />
          </div>

          {/* Card 5 - Website */}
          <div 
            className="relative overflow-hidden aspect-square w-full max-w-80 mx-auto cursor-pointer transform transition-transform hover:scale-105"
            onClick={handleWebsiteClick}
          >
            <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-2xl h-full border border-gray-700 flex flex-col items-center justify-center text-center">
              <div className="mb-4 sm:mb-6">
                <Globe size={48} className="text-purple-400 mx-auto sm:w-16 sm:h-16" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white tracking-wide">Website</h2>
              <p className="text-gray-300 text-sm font-medium">
                Visit my website
              </p>
            </div>
            <BorderBeam 
              size={100} 
              duration={12} 
              delay={6}
              colorFrom="#a855f7" 
              colorTo="#ec4899" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App