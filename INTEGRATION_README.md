# Frontend-Backend Integration Guide

## Overview

This project now includes a complete integration between your React/TypeScript frontend and FastAPI backend for image scraping functionality. The integration adds a new "Image Scraper" option to your games collection.

## What's Been Added

### 1. API Integration Layer (`src/lib/api.ts`)
- Complete TypeScript API client for your FastAPI backend
- Type-safe interfaces matching your backend models
- Error handling utilities
- Configurable API base URL via environment variables

### 2. Image Scraper Component (`src/components/ImageScraperGame.tsx`)
- Full-featured React component for image scraping
- Backend connection status checking
- Source selection interface
- Image gallery with download functionality
- Loading states and error handling
- Responsive design matching your existing games

### 3. Updated Main App (`src/App.tsx`)
- Added Image Scraper as a new game option
- Updated grid layout to accommodate 5 cards
- Added routing for the new component

### 4. Development Tools
- Environment variables setup (`.env`)
- Development startup script (`start-dev.sh`)
- CSS utilities for better image display

## Project Structure

```
sgames/
├── src/
│   ├── components/
│   │   ├── ImageScraperGame.tsx    # New image scraper interface
│   │   ├── WordleGame.tsx
│   │   ├── HangmanGame.tsx
│   │   └── CrosswordGame.tsx
│   ├── lib/
│   │   ├── api.ts                  # New API integration layer
│   │   └── utils.ts
│   ├── App.tsx                     # Updated with image scraper
│   └── index.css                   # Added line-clamp utility
├── backend/                        # Your existing FastAPI backend
│   └── main.py
├── .env                           # Environment variables
├── start-dev.sh                   # Development startup script
└── package.json                   # Updated with axios dependency
```

## How to Run

### Option 1: Using the Startup Script (Recommended)
```bash
./start-dev.sh
```

This will:
- Start your FastAPI backend on port 8000
- Start the React frontend on port 5173
- Handle cleanup when you stop the script

### Option 2: Manual Setup

1. **Start the Backend:**
```bash
cd backend
python main.py
```

2. **Start the Frontend:**
```bash
npm run dev
```

## Features

### Image Scraper Interface
- **Source Selection**: Choose from available scraping configurations
- **Collect All**: Scrape from all sources at once
- **Image Gallery**: Responsive grid layout for scraped images
- **Download**: Direct download of images with proper naming
- **External Links**: Open source URLs in new tabs
- **Metadata Display**: Shows upvotes, comments, creation date, and author
- **Error Handling**: Graceful handling of API errors and connection issues

### Backend Connection
- **Health Check**: Automatic backend connectivity testing
- **Connection Status**: Clear indication if backend is unavailable
- **Retry Logic**: Easy retry for failed connections
- **Error Messages**: User-friendly error descriptions

## API Endpoints Used

The frontend integrates with these backend endpoints:

- `GET /health` - Health check
- `GET /sources` - Get available scraping sources
- `GET /images/collect/{config_name}` - Scrape from specific source
- `GET /images/collect` - Scrape from all sources

## Environment Variables

The `.env` file contains:
- `VITE_API_URL`: Backend API URL (defaults to http://localhost:8000)
- `VITE_NODE_ENV`: Development environment setting

## Dependencies Added

- `axios`: HTTP client for API communication (already installed)

## Usage

1. Start both servers using `./start-dev.sh`
2. Navigate to http://localhost:5173
3. Click on the "Image Scraper" card
4. Select a source or choose "Collect All"
5. Wait for images to load
6. Download images or visit source URLs as needed

## Error Handling

The integration includes comprehensive error handling:
- Backend connectivity issues
- API request failures
- Network timeouts
- Invalid responses
- Rate limiting

## Customization

### Changing the API URL
Update the `VITE_API_URL` in `.env` to point to a different backend server.

### Adding New API Endpoints
Extend the `ImageScraperAPI` class in `src/lib/api.ts` to add new functionality.

### Styling
The component uses the same Tailwind CSS classes as your existing games for consistency.

## Troubleshooting

### Backend Not Connecting
- Ensure your FastAPI server is running on port 8000
- Check that the backend directory exists and contains your FastAPI code
- Verify CORS settings in your backend allow requests from localhost:5173

### Images Not Loading
- Check browser console for network errors
- Verify image URLs are accessible
- Ensure the backend is returning valid image data

### Development Script Issues
- Make sure the script is executable: `chmod +x start-dev.sh`
- Ensure you have Python 3 and Node.js installed
- Check that you're running the script from the project root

## Next Steps

You can now:
1. Extend the API with new scraping sources
2. Add image filtering and search functionality
3. Implement image favoriting/bookmarking
4. Add batch download features
5. Integrate with cloud storage services

The integration is complete and ready for development! 