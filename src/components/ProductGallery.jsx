import React, { useState, useEffect } from 'react'
import '../styles/components/product-gallery.css'

export default function ProductGallery({ images = [] }) {
  const imgs = images.length ? images : ['/no-image.png']
  const [mainIndex, setMainIndex] = useState(0)
  const [fade, setFade] = useState(false)
  const [showZoom, setShowZoom] = useState(false)
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [translateX, setTranslateX] = useState(0)

  const main = imgs[mainIndex]

  const handleChange = (index) => {
    setFade(true)
    setTimeout(() => {
      setMainIndex(index)
      setFade(false)
    }, 200)
  }

  const prevImage = () => {
    handleChange((mainIndex - 1 + imgs.length) % imgs.length)
  }

  const nextImage = () => {
    handleChange((mainIndex + 1) % imgs.length)
  }

  const openZoom = () => {
    setShowZoom(true)
    document.body.style.overflow = 'hidden'
    // Hide header elements
    const topbar = document.getElementById('topbar')
    const mainNav = document.getElementById('mainNav')
    if (topbar) topbar.style.display = 'none'
    if (mainNav) mainNav.style.display = 'none'
  }

  const closeZoom = () => {
    setShowZoom(false)
    document.body.style.overflow = ''
    // Show header elements
    const topbar = document.getElementById('topbar')
    const mainNav = document.getElementById('mainNav')
    if (topbar) topbar.style.display = ''
    if (mainNav) mainNav.style.display = ''
  }

  const handleZoomPrev = (e) => {
    e.stopPropagation()
    prevImage()
  }

  const handleZoomNext = (e) => {
    e.stopPropagation()
    nextImage()
  }

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setCurrentX(e.clientX)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const diff = e.clientX - startX
    setCurrentX(e.clientX)
    setTranslateX(diff)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    
    const diff = currentX - startX
    const threshold = 100 // minimum drag distance

    setIsDragging(false) // Enable transition

    if (diff > threshold) {
      // Dragged right -> previous image
      const newIndex = (mainIndex - 1 + imgs.length) % imgs.length
      setMainIndex(newIndex)
    } else if (diff < -threshold) {
      // Dragged left -> next image
      const newIndex = (mainIndex + 1) % imgs.length
      setMainIndex(newIndex)
    } else {
      // Not enough drag, snap back
      setTranslateX(0)
    }

    // Clean up drag state
    setStartX(0)
    setCurrentX(0)
  }
  

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp()
    }
  }

  // Reset translate when index changes
  useEffect(() => {
    setTranslateX(0)
  }, [mainIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!showZoom) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'Escape') closeZoom()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showZoom, mainIndex])

  return (
    <>
      <section className="gallery" aria-label="Hình ảnh sản phẩm">
        <div className="breadcrumb muted" style={{ marginBottom: 10 }}>
          <a href="/">Trang chủ</a> / <a href="/#">Điện thoại</a> / <span>{/* title filled outside */}</span>
        </div>

        <div 
          className={`main-image ${fade ? 'fade' : ''}`} 
          id="mainImage"
          onClick={openZoom}
          style={{ cursor: 'zoom-in' }}
        >
          <button className="nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Ảnh trước">‹</button>
          <img src={main} alt="" />
          <button className="nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Ảnh tiếp">›</button>
          
          {/* Zoom indicator */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <i className="fa fa-search-plus"></i>
            Click để phóng to
          </div>
        </div>

        <div className="thumbs" id="thumbs">
          {imgs.map((src, i) => (
            <button key={i} onClick={() => handleChange(i)} aria-label={`Ảnh ${i+1}`}>
              <img src={src} alt="" className={i === mainIndex ? 'active-thumb' : ''} />
            </button>
          ))}
        </div>
      </section>

      {/* Zoom Modal */}
      {showZoom && (
        <div 
          className="zoom-modal"
          onClick={closeZoom}
        >
          {/* Backdrop blur */}
          <div className="zoom-backdrop" />

          {/* Content */}
          <div className="zoom-content-wrapper">
            {/* Close button */}
            <button 
              className="zoom-close" 
              onClick={closeZoom}
              aria-label="Đóng"
            >
              ✕
            </button>

            {/* Navigation buttons */}
            <button 
              className="zoom-nav zoom-prev" 
              onClick={handleZoomPrev}
              aria-label="Ảnh trước"
            >
              ‹
            </button>

            <button 
              className="zoom-nav zoom-next" 
              onClick={handleZoomNext}
              aria-label="Ảnh tiếp"
            >
              › 
            </button>

            {/* Main Image */}
            <div 
              className="zoom-image-wrapper" 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {/* Images Container */}
              <div 
                className="zoom-images-track"
                style={{
                  transform: `translateX(calc(-${mainIndex * 100}% + ${translateX}px))`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
              >
                {imgs.map((img, idx) => (
                  <div key={idx} className="zoom-image-slide">
                    <img src={img} alt={`Ảnh ${idx + 1}`} draggable="false" />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="zoom-controls">
              {/* Thumbnails */}
              <div className="zoom-thumbs-wrapper">
                {imgs.map((src, i) => (
                  <div 
                    key={i} 
                    className={`zoom-thumb ${i === mainIndex ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleChange(i); }}
                  >
                    <img src={src} alt={`Ảnh ${i+1}`} />
                  </div>
                ))}
              </div>
              
              {/* Counter */}
              <div className="zoom-counter">
                {mainIndex + 1} / {imgs.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}