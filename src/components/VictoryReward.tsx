import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { fetchAllImages } from '../lib/api';
import type { BackendImage } from '../lib/api';
import { loadGameStats, type GameStats } from '../lib/gameStats';

interface VictoryRewardProps {
  onBack: () => void;
  gameName?: string;
}

const VictoryReward: React.FC<VictoryRewardProps> = ({ onBack }) => {
  const [allImages, setAllImages] = useState<BackendImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({ totalWins: 0, wordleWins: 0, hangmanWins: 0, crosswordWins: 0 });

  // Fallback images for when backend is unavailable
  const fallbackImages: BackendImage[] = [
    {
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Golden Trophy",
      source_url: "",
      source: "Unsplash"
    },
    {
      url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Celebration",
      source_url: "",
      source: "Unsplash"
    },
    {
      url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Victory Star",
      source_url: "",
      source: "Unsplash"
    },
    {
      url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Achievement",
      source_url: "",
      source: "Unsplash"
    },
    {
      url: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Success",
      source_url: "",
      source: "Unsplash"
    },
    {
      url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Reward",
      source_url: "",
      source: "Unsplash"
    },
    {
      url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Victory Crown",
      source_url: "",
      source: "Unsplash"
    },
    {
      url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Champion",
      source_url: "",
      source: "Unsplash"
    },
    {
      url: "https://images.unsplash.com/photo-1540479859555-17af45c78602?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Fireworks",
      source_url: "",
      source: "Unsplash"
    },
    {
      url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Celebration Party",
      source_url: "",
      source: "Unsplash"
    },
    {
      url: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Mountain Peak",
      source_url: "",
      source: "Unsplash"
    },
    {
      url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Finish Line",
      source_url: "",
      source: "Unsplash"
    }
  ];

  // Load all images from backend or use fallback
  const loadAllImages = async () => {
    try {
      setError(null);
      console.log('🔄 Attempting to fetch images from backend...');
      const backendData = await fetchAllImages();
      console.log('📦 Backend response structure:', backendData);
      console.log('📦 Backend response type:', typeof backendData);
      console.log('📦 Backend response keys:', Object.keys(backendData || {}));
      
      // Extract images from the response structure
      let images: BackendImage[] = [];
      if (backendData.sources && Array.isArray(backendData.sources)) {
        console.log('✅ Found sources array, extracting images...');
        // If response has sources array, collect all images
        for (const sourceData of backendData.sources) {
          console.log('📦 Source data:', sourceData);
          if (sourceData.images && Array.isArray(sourceData.images)) {
            console.log(`✅ Found ${sourceData.images.length} images in source`);
            images.push(...sourceData.images);
          }
        }
      } else if (backendData.images && Array.isArray(backendData.images)) {
        console.log('✅ Found direct images array');
        // If response has direct images array
        images = backendData.images;
      } else {
        console.log('❌ No images found in expected structure');
        console.log('📦 Available keys:', Object.keys(backendData || {}));
      }

      console.log(`🖼️ Total images extracted: ${images.length}`);
      if (images.length > 0) {
        console.log('🖼️ First image sample:', images[0]);
      }

      if (images.length === 0) {
        throw new Error('No images found in backend response');
      }

      setAllImages(images);
      console.log('✅ Successfully loaded images from backend');
    } catch (err) {
      console.error('❌ Failed to load images from backend:', err);
      setError('Using fallback images - backend unavailable');
      setAllImages(fallbackImages);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const stats = loadGameStats();
      setGameStats(stats);
      await loadAllImages();
      setLoading(false);
    };

    initializeData();
  }, []);

  const isImageUnlocked = (imageIndex: number): boolean => {
    return imageIndex < gameStats.totalWins;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Gallery...</h2>
          <p className="text-gray-300">Fetching your reward images</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Minimal Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Victory Gallery</h1>
            <p className="text-gray-400 text-sm">Win games to unlock images • {gameStats.totalWins} / {allImages.length} unlocked</p>
            {error && (
              <p className="text-yellow-400 text-xs mt-1">{error}</p>
            )}
          </div>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8 text-center">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-400 font-bold text-lg">{gameStats.totalWins}</div>
              <div className="text-gray-400">Total Wins</div>
            </div>
            <div>
              <div className="text-green-400 font-bold text-lg">{gameStats.wordleWins}</div>
              <div className="text-gray-400">Wordle</div>
            </div>
            <div>
              <div className="text-emerald-400 font-bold text-lg">{gameStats.hangmanWins}</div>
              <div className="text-gray-400">Hangman</div>
            </div>
            <div>
              <div className="text-amber-400 font-bold text-lg">{gameStats.crosswordWins}</div>
              <div className="text-gray-400">Crossword</div>
            </div>
          </div>
        </div>

        {/* Minimalistic Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {allImages.map((image, index) => {
            const unlocked = isImageUnlocked(index);
            
            return (
              <div
                key={index}
                className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden group"
              >
                <img
                  src={unlocked ? image.url : ''}
                  alt={unlocked ? image.title : 'Locked'}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    unlocked 
                      ? 'opacity-100 group-hover:scale-105' 
                      : 'opacity-0'
                  }`}
                  onError={(e) => {
                    if (unlocked) {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                    }
                  }}
                />
                
                {/* Locked overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <Lock className="text-gray-500 mx-auto mb-2" size={32} />
                      <p className="text-gray-500 text-xs">Win {index + 1} game{index + 1 > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}

                {/* Unlocked indicator */}
                {unlocked && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star className="text-yellow-400" size={16} fill="currentColor" />
                  </div>
                )}

                {/* Image info on hover */}
                {unlocked && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium truncate">{image.title}</p>
                    {image.source && (
                      <p className="text-gray-300 text-xs">{image.source}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state for no wins */}
        {gameStats.totalWins === 0 && (
          <div className="text-center mt-12 p-8">
            <Lock className="text-gray-600 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Start Your Victory Journey</h3>
            <p className="text-gray-400">Win your first game to unlock your first reward image!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VictoryReward; 