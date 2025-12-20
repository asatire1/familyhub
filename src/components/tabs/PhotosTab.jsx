import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Heart, 
  Trash2, 
  Play, 
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Image,
  Upload,
  Grid,
  Maximize2,
  Clock,
  Sparkles
} from 'lucide-react';
import './PhotosTab.css';

export default function PhotosTab() {
  const { 
    photos,
    addPhoto,
    deletePhoto,
    togglePhotoFavorite,
    getPhotosSorted,
    getFavoritePhotos,
    slideshowMode,
    setSlideshowMode,
    canManageTasks,
    settings
  } = useApp();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'slideshow'
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideshowInterval, setSlideshowIntervalTime] = useState(5000); // 5 seconds
  const [filter, setFilter] = useState('all'); // 'all' or 'favorites'
  const [showUpload, setShowUpload] = useState(false);
  
  const fileInputRef = useRef(null);
  const slideshowTimerRef = useRef(null);

  // Get filtered photos
  const displayPhotos = filter === 'favorites' 
    ? getFavoritePhotos() 
    : getPhotosSorted('newest');

  // Slideshow auto-advance
  useEffect(() => {
    if (isPlaying && displayPhotos.length > 1) {
      slideshowTimerRef.current = setInterval(() => {
        setCurrentSlideIndex(prev => 
          prev >= displayPhotos.length - 1 ? 0 : prev + 1
        );
      }, slideshowInterval);
    }

    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
      }
    };
  }, [isPlaying, displayPhotos.length, slideshowInterval]);

  // Compress image to reduce size for Firestore storage
  const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          
          // Scale down if larger than maxWidth
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      
      try {
        // Compress image before storing (to avoid Firestore 1MB limit)
        const compressedUrl = await compressImage(file);
        
        // Check if still too large (Firestore has ~1MB doc limit)
        if (compressedUrl.length > 900000) {
          // Try with lower quality
          const smallerUrl = await compressImage(file, 800, 0.5);
          if (smallerUrl.length > 900000) {
            alert(`Image "${file.name}" is too large. Please use a smaller image.`);
            continue;
          }
          await addPhoto({
            url: smallerUrl,
            name: file.name,
            type: 'image/jpeg',
            isFavorite: false
          });
        } else {
          await addPhoto({
            url: compressedUrl,
            name: file.name,
            type: 'image/jpeg',
            isFavorite: false
          });
        }
      } catch (err) {
        console.error('Error processing image:', err);
        alert(`Failed to upload "${file.name}"`);
      }
    }
    
    setShowUpload(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle delete
  const handleDelete = async (photoId, e) => {
    e?.stopPropagation();
    if (window.confirm('Delete this photo?')) {
      await deletePhoto(photoId);
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (photoId, e) => {
    e?.stopPropagation();
    await togglePhotoFavorite(photoId);
  };

  // Slideshow navigation
  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex(prev => 
      prev >= displayPhotos.length - 1 ? 0 : prev + 1
    );
  }, [displayPhotos.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex(prev => 
      prev <= 0 ? displayPhotos.length - 1 : prev - 1
    );
  }, [displayPhotos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode === 'slideshow' || selectedPhoto) {
        if (e.key === 'ArrowRight') goToNextSlide();
        if (e.key === 'ArrowLeft') goToPrevSlide();
        if (e.key === 'Escape') {
          setSelectedPhoto(null);
          setViewMode('grid');
          setIsPlaying(false);
        }
        if (e.key === ' ') {
          e.preventDefault();
          setIsPlaying(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, selectedPhoto, goToNextSlide, goToPrevSlide]);

  // Start slideshow
  const startSlideshow = () => {
    setViewMode('slideshow');
    setCurrentSlideIndex(0);
    setIsPlaying(true);
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="photos-tab">
      {/* Header */}
      <div className="photos-header">
        <div className="photos-title-section">
          <h2>Photos</h2>
          <span className="photo-count">{photos.length} photos</span>
        </div>

        <div className="photos-actions">
          {/* Filter */}
          <div className="filter-toggle">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              <Grid size={16} />
              All
            </button>
            <button 
              className={filter === 'favorites' ? 'active' : ''}
              onClick={() => setFilter('favorites')}
            >
              <Heart size={16} />
              Favorites
            </button>
          </div>

          {/* Slideshow button */}
          {displayPhotos.length > 0 && (
            <button 
              className="slideshow-btn"
              onClick={startSlideshow}
            >
              <Play size={18} />
              Slideshow
            </button>
          )}

          {/* Upload button */}
          {canManageTasks() && (
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={20} />
              Add Photos
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="photos-grid">
          {displayPhotos.length === 0 ? (
            <div className="no-photos">
              <Image size={64} strokeWidth={1} />
              <h3>No photos yet</h3>
              <p>Add some family photos to display</p>
              {canManageTasks() && (
                <button onClick={() => fileInputRef.current?.click()}>
                  <Upload size={18} />
                  Upload Photos
                </button>
              )}
            </div>
          ) : (
            displayPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                className="photo-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPhoto(photo)}
                whileHover={{ scale: 1.02 }}
              >
                <img src={photo.url} alt={photo.name || 'Family photo'} />
                
                <div className="photo-overlay">
                  <button 
                    className={`favorite-btn ${photo.isFavorite ? 'active' : ''}`}
                    onClick={(e) => handleToggleFavorite(photo.id, e)}
                  >
                    <Heart size={20} fill={photo.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  
                  {canManageTasks() && (
                    <button 
                      className="delete-btn"
                      onClick={(e) => handleDelete(photo.id, e)}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {photo.isFavorite && (
                  <div className="favorite-badge">
                    <Heart size={14} fill="currentColor" />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Slideshow View */}
      <AnimatePresence>
        {viewMode === 'slideshow' && displayPhotos.length > 0 && (
          <motion.div 
            className="slideshow-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Close button */}
            <button 
              className="slideshow-close"
              onClick={() => {
                setViewMode('grid');
                setIsPlaying(false);
              }}
            >
              <X size={24} />
            </button>

            {/* Current photo */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                className="slideshow-photo"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src={displayPhotos[currentSlideIndex]?.url} 
                  alt="Slideshow" 
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <button 
              className="slideshow-nav prev"
              onClick={goToPrevSlide}
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              className="slideshow-nav next"
              onClick={goToNextSlide}
            >
              <ChevronRight size={32} />
            </button>

            {/* Controls */}
            <div className="slideshow-controls">
              <button 
                className="play-pause-btn"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              <div className="slideshow-progress">
                {displayPhotos.map((_, index) => (
                  <button
                    key={index}
                    className={`progress-dot ${index === currentSlideIndex ? 'active' : ''}`}
                    onClick={() => setCurrentSlideIndex(index)}
                  />
                ))}
              </div>

              <div className="speed-control">
                <Clock size={16} />
                <select 
                  value={slideshowInterval}
                  onChange={(e) => setSlideshowIntervalTime(Number(e.target.value))}
                >
                  <option value={3000}>3s</option>
                  <option value={5000}>5s</option>
                  <option value={8000}>8s</option>
                  <option value={10000}>10s</option>
                </select>
              </div>

              <span className="slide-counter">
                {currentSlideIndex + 1} / {displayPhotos.length}
              </span>
            </div>

            {/* Photo info */}
            {displayPhotos[currentSlideIndex]?.uploadedAt && (
              <div className="slideshow-info">
                <span>{formatDate(displayPhotos[currentSlideIndex].uploadedAt)}</span>
                {displayPhotos[currentSlideIndex].isFavorite && (
                  <Heart size={16} fill="currentColor" className="fav-icon" />
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && viewMode === 'grid' && (
          <motion.div 
            className="photo-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              className="photo-modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="modal-close"
                onClick={() => setSelectedPhoto(null)}
              >
                <X size={24} />
              </button>

              <img src={selectedPhoto.url} alt={selectedPhoto.name || 'Photo'} />

              <div className="photo-modal-actions">
                <button 
                  className={`favorite-btn ${selectedPhoto.isFavorite ? 'active' : ''}`}
                  onClick={() => togglePhotoFavorite(selectedPhoto.id)}
                >
                  <Heart size={22} fill={selectedPhoto.isFavorite ? 'currentColor' : 'none'} />
                  {selectedPhoto.isFavorite ? 'Favorited' : 'Add to favorites'}
                </button>

                <button 
                  className="fullscreen-btn"
                  onClick={() => {
                    const index = displayPhotos.findIndex(p => p.id === selectedPhoto.id);
                    setCurrentSlideIndex(index >= 0 ? index : 0);
                    setSelectedPhoto(null);
                    setViewMode('slideshow');
                  }}
                >
                  <Maximize2 size={20} />
                  View fullscreen
                </button>

                {canManageTasks() && (
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(selectedPhoto.id)}
                  >
                    <Trash2 size={20} />
                    Delete
                  </button>
                )}
              </div>

              {selectedPhoto.uploadedAt && (
                <div className="photo-modal-info">
                  <span>Added {formatDate(selectedPhoto.uploadedAt)}</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
