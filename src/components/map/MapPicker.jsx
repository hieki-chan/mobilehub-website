import React, { useCallback, useRef, useState } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import './map-picker.css'

export default function MapPicker({ onSelect, onClose, initial }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
  })

  const [position, setPosition] = useState(initial || { lat: 21.028511, lng: 105.804817 })
  const mapRef = useRef(null)

  const handleClick = useCallback((e) => {
    const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
    setPosition(pos)
  }, [])

  const handleConfirm = () => {
    console.log(position);
    onSelect(position)
    onClose()
  }

  if (!isLoaded) return <div className="map-loading">Đang tải bản đồ...</div>

  return (
    <div className="map-modal">
      <div className="map-header">
        <i className="fa fa-exclamation-circle"></i>
        <div>
          <div className="title">Vui lòng ghim địa chỉ chính xác</div>
          <div className="desc">Hãy chắc chắn vị trí trên bản đồ được ghim đúng để hệ thống giao hàng chính xác!</div>
        </div>
      </div>

      <div className="map-container">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '400px' }}
          center={position}
          zoom={16}
          onClick={handleClick}
          onLoad={map => (mapRef.current = map)}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            fullscreenControl: false,
            mapTypeControl: false
          }}
        >
          <Marker position={position} draggable animation={window.google.maps.Animation.DROP}
                  onDragEnd={handleClick} />
        </GoogleMap>
      </div>

      <div className="map-footer">
        <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
        <button className="btn btn-primary" onClick={handleConfirm}>Xác nhận vị trí</button>
      </div>
    </div>
  )
}
