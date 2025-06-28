// API service for communicating with the FastAPI backend
import { config } from './config';

const API_BASE_URL = config.backend.url;

// Types for API responses
export interface BackendImage {
  url: string;
  title: string;
  source_url: string;
  author?: string;
  created_at?: string;
  upvotes?: number;
  comments?: number;
  source: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
}

export interface CollectImagesResponse {
  images: BackendImage[];
  total_count: number;
  source: string;
  source_id: string;
  config_name: string;
  description: string;
}

export interface SourcesResponse {
  sources: string[];
  source_details: Record<string, any>;
  total_count: number;
}

// Fetch available sources from backend
export const fetchAvailableSources = async (): Promise<SourcesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sources`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sources:', error);
    throw error;
  }
};

// Fetch images from a specific configuration
export const fetchImagesFromConfig = async (configName: string): Promise<CollectImagesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/images/collect/${configName}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching images from config ${configName}:`, error);
    throw error;
  }
};

// Fetch images from all configurations
export const fetchAllImages = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/images/collect`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching all images:', error);
    throw error;
  }
};

// Utility function to get random victory images from backend
export const fetchRandomVictoryImages = async (count: number = 5): Promise<BackendImage[]> => {
  try {
    // First, get available sources
    const sourcesResponse = await fetchAvailableSources();
    const availableSources = sourcesResponse.sources;
    
    if (availableSources.length === 0) {
      throw new Error('No sources available');
    }
    
    // Collect images from multiple sources to get a diverse set
    const allImages: BackendImage[] = [];
    
    // Try to fetch from multiple sources
    for (const source of availableSources.slice(0, 3)) { // Limit to first 3 sources to avoid too many requests
      try {
        const response = await fetchImagesFromConfig(source);
        allImages.push(...response.images);
      } catch (error) {
        console.warn(`Failed to fetch from source ${source}:`, error);
        // Continue with other sources
      }
    }
    
    if (allImages.length === 0) {
      throw new Error('No images could be fetched from any source');
    }
    
    // Shuffle and pick random images
    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
    
  } catch (error) {
    console.error('Error fetching random victory images:', error);
    throw error;
  }
};

// Utility function to get a single random victory image
export const fetchSingleRandomVictoryImage = async (): Promise<BackendImage | null> => {
  try {
    const images = await fetchRandomVictoryImages(1);
    return images.length > 0 ? images[0] : null;
  } catch (error) {
    console.error('Error fetching single random victory image:', error);
    return null;
  }
}; 