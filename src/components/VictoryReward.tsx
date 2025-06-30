import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Star, Play } from 'lucide-react';
import { fetchAllImages, fetchAllVideos } from '../lib/api';
import type { BackendImage, BackendVideo } from '../lib/api';
import { loadGameStats, type GameStats } from '../lib/gameStats';

interface VictoryRewardProps {
  onBack: () => void;
  gameName?: string;
}

// Combined media type for the gallery
type MediaItem = (BackendImage | BackendVideo) & {
  type: 'image' | 'video';
};

const VictoryReward: React.FC<VictoryRewardProps> = ({ onBack }) => {
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
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
    }
  ];

  // Fallback videos for when backend is unavailable
  const fallbackVideos: BackendVideo[] = [
    {
      url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      title: "Victory Celebration",
      source_url: "",
      source: "Sample Videos",
      thumbnail_url: "https://images.unsplash.com/photo-1540479859555-17af45c78602?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: 30
    },
    {
      url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
      title: "Trophy Animation",
      source_url: "",
      source: "Sample Videos",
      thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: 45
    },
    {
      url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
      title: "Confetti Burst",
      source_url: "",
      source: "Sample Videos",
      thumbnail_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: 60
    }
  ];

  // Helper function to determine if item is a video
  const isVideo = (item: MediaItem): item is BackendVideo & { type: 'video' } => {
    return item.type === 'video';
  };

  // Load all media from backend or use fallback
  const loadAllMedia = async () => {
    try {
      setError(null);
      console.log('🔄 Attempting to fetch media from backend...');
      
      // Fetch both images and videos in parallel
      const [imagesResponse, videosResponse] = await Promise.allSettled([
        fetchAllImages(),
        fetchAllVideos()
      ]);
      
      let images: BackendImage[] = [];
      let videos: BackendVideo[] = [];
      
      // Process images response
      if (imagesResponse.status === 'fulfilled') {
        const imageData = imagesResponse.value;
        console.log('📦 Images response structure:', imageData);
        
        if (imageData.results && typeof imageData.results === 'object') {
          console.log('✅ Found images results object, extracting...');
          const configKeys = Object.keys(imageData.results);
          
          for (const configName of configKeys) {
            const configData = imageData.results[configName];
            if (configData.images && Array.isArray(configData.images)) {
              console.log(`✅ Found ${configData.images.length} images in config "${configName}"`);
              images.push(...configData.images);
            }
          }
        }
      } else {
        console.error('❌ Failed to fetch images:', imagesResponse.reason);
      }
      
      // Process videos response
      if (videosResponse.status === 'fulfilled') {
        const videoData = videosResponse.value;
        console.log('📦 Videos response structure:', videoData);
        
        if (videoData.results && typeof videoData.results === 'object') {
          console.log('✅ Found videos results object, extracting...');
          const configKeys = Object.keys(videoData.results);
          
          for (const configName of configKeys) {
            const configData = videoData.results[configName];
            if (configData.videos && Array.isArray(configData.videos)) {
              console.log(`✅ Found ${configData.videos.length} videos in config "${configName}"`);
              videos.push(...configData.videos);
            }
          }
        }
      } else {
        console.error('❌ Failed to fetch videos:', videosResponse.reason);
      }

      // If no media found, use fallbacks
      if (images.length === 0 && videos.length === 0) {
        console.log('❌ No media found, using fallbacks');
        images = fallbackImages;
        videos = fallbackVideos;
        setError('Using fallback media - backend unavailable');
      }

      // Combine and shuffle media
      const combinedMedia: MediaItem[] = [
        ...images.map(img => ({ ...img, type: 'image' as const })),
        ...videos.map(vid => ({ ...vid, type: 'video' as const }))
      ];

      // Shuffle the combined array for variety
      const shuffledMedia = combinedMedia.sort(() => Math.random() - 0.5);
      
      setAllMedia(shuffledMedia);
      console.log(`✅ Successfully loaded ${shuffledMedia.length} media items (${images.length} images, ${videos.length} videos)`);
      
    } catch (err) {
      console.error('❌ Failed to load media from backend:', err);
      setError('Using fallback media - backend unavailable');
      const fallbackMedia: MediaItem[] = [
        ...fallbackImages.map(img => ({ ...img, type: 'image' as const })),
        ...fallbackVideos.map(vid => ({ ...vid, type: 'video' as const }))
      ];
      setAllMedia(fallbackMedia.sort(() => Math.random() - 0.5));
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const stats = loadGameStats();
      setGameStats(stats);
      await loadAllMedia();
      setLoading(false);
    };

    initializeData();
  }, []);

  const isMediaUnlocked = (mediaIndex: number): boolean => {
    return mediaIndex < gameStats.totalWins * 5; // 5 items unlock per win
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Gallery...</h2>
          <p className="text-gray-300">Fetching your reward images and videos</p>
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
            <p className="text-gray-400 text-sm">Win games to unlock 5 items each • {Math.min(gameStats.totalWins * 5, allMedia.length)} / {allMedia.length} unlocked</p>
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

        {/* Mixed Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {allMedia.map((media, index) => {
            const unlocked = isMediaUnlocked(index);
            const mediaIsVideo = isVideo(media);
            
            return (
              <div
                key={index}
                className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden group"
              >
                {/* Media content */}
                <img
                  src={unlocked ? (mediaIsVideo ? media.thumbnail_url || media.url : media.url) : ''}
                  alt={unlocked ? media.title : 'Locked'}
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

                {/* Video play button overlay */}
                {unlocked && mediaIsVideo && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="bg-white/90 rounded-full p-3">
                      <Play className="text-gray-900" size={24} fill="currentColor" />
                    </div>
                  </div>
                )}

                {/* Media type indicator */}
                {unlocked && (
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      mediaIsVideo 
                        ? 'bg-red-500/80 text-white' 
                        : 'bg-blue-500/80 text-white'
                    }`}>
                      {mediaIsVideo ? 'VIDEO' : 'IMAGE'}
                    </div>
                  </div>
                )}
                
                {/* Locked overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <Lock className="text-gray-500 mx-auto mb-2" size={32} />
                      <p className="text-gray-500 text-xs">Win {Math.ceil((index + 1) / 5)} game{Math.ceil((index + 1) / 5) > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}

                {/* Unlocked indicator */}
                {unlocked && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star className="text-yellow-400" size={16} fill="currentColor" />
                  </div>
                )}

                {/* Media info on hover */}
                {unlocked && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium truncate">{media.title}</p>
                    {media.source && (
                      <p className="text-gray-300 text-xs">{media.source}</p>
                    )}
                    {mediaIsVideo && media.duration && (
                      <p className="text-gray-300 text-xs">{Math.round(media.duration)}s</p>
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
            <p className="text-gray-400">Win your first game to unlock your first 5 reward items!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VictoryReward; 