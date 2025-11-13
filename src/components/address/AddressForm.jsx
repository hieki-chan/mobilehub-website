import React, { useState, useEffect } from 'react'
import MapPicker from '../map/MapPicker'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import '../../styles/components/profile/address-form.css'

export default function AddressForm({ onClose, onSave, initial }) {
  const [cities, setCities] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [showMap, setShowMap] = useState(false)
  const [errors, setErrors] = useState({})

  const [location, setLocation] = useState(
    initial?.latitude && initial?.longitude
      ? { lat: initial.latitude, lng: initial.longitude }
      : null
  )

  const [formData, setFormData] = useState({
    fullName: initial?.fullName || '',
    phoneNumber: initial?.phoneNumber || '',
    province: initial?.province || '',
    district: initial?.district || '',
    ward: initial?.ward || '',
    addressDetail: initial?.addressDetail || '',
    isDefault: initial?.isDefault || false,
    latitude: initial?.latitude || null,
    longitude: initial?.longitude || null,
  })

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
  })

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(setCities)
  }, [])

  useEffect(() => {
    if (!formData.province || cities.length === 0) {
      setDistricts([])
      setWards([])
      return
    }

    const city = cities.find(c => c.name === formData.province)
    if (!city) return

    fetch(`https://provinces.open-api.vn/api/p/${city.code}?depth=2`)
      .then(res => res.json())
      .then(data => setDistricts(data.districts))
  }, [formData.province, cities])

  useEffect(() => {
    if (initial && districts.length > 0 && initial.district) {
      setFormData(prev => ({ ...prev, district: initial.district }))
    }
  }, [districts])

  useEffect(() => {
    if (!formData.district || districts.length === 0) {
      setWards([])
      return
    }

    const district = districts.find(d => d.name === formData.district)
    if (!district) return

    fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
      .then(res => res.json())
      .then(data => setWards(data.wards))
  }, [formData.district, districts])

  useEffect(() => {
    if (initial && wards.length > 0 && initial.ward) {
      setFormData(prev => ({ ...prev, ward: initial.ward }))
    }
  }, [wards])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên'
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại'
    if (!formData.province) newErrors.province = 'Chọn Tỉnh/Thành phố'
    if (!formData.district) newErrors.district = 'Chọn Quận/Huyện'
    if (!formData.ward) newErrors.ward = 'Chọn Phường/Xã'
    if (!formData.addressDetail.trim()) newErrors.addressDetail = 'Nhập địa chỉ cụ thể'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSave(formData)
  }

  return (
    <div className="modal-overlay open">
      <div className="modal address-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-body">
          <h3>{initial ? 'Cập nhật địa chỉ' : 'Địa chỉ mới'}</h3>

          <form className="address-add-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field">
                <input name="fullName" placeholder="Họ và tên"
                  value={formData.fullName} onChange={handleChange} />
                {errors.fullName && <div className="field-error">{errors.fullName}</div>}
              </div>

              <div className="field">
                <input name="phoneNumber" placeholder="Số điện thoại"
                  value={formData.phoneNumber} onChange={handleChange} />
                {errors.phoneNumber && <div className="field-error">{errors.phoneNumber}</div>}
              </div>
            </div>

            <div className="field">
              <select name="province" value={formData.province} onChange={handleChange}>
                <option value="">Chọn Tỉnh/Thành phố</option>
                {cities.map(c => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
              {errors.province && <div className="field-error">{errors.province}</div>}
            </div>

            <div className="field">
              <select name="district" value={formData.district}
                onChange={handleChange} disabled={!districts.length}>
                <option value="">Chọn Quận/Huyện</option>
                {districts.map(d => (
                  <option key={d.code} value={d.name}>{d.name}</option>
                ))}
              </select>
              {errors.district && <div className="field-error">{errors.district}</div>}
            </div>

            <div className="field">
              <select name="ward" value={formData.ward}
                onChange={handleChange} disabled={!wards.length}>
                <option value="">Chọn Phường/Xã</option>
                {wards.map(w => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
              {errors.ward && <div className="field-error">{errors.ward}</div>}
            </div>

            <div className="field">
              <input name="addressDetail" placeholder="Địa chỉ cụ thể"
                value={formData.addressDetail} onChange={handleChange} />
              {errors.addressDetail && <div className="field-error">{errors.addressDetail}</div>}
            </div>

            {!location && (
              <div className="map-placeholder">
                <button type="button" className="btn-map" onClick={() => setShowMap(true)}>
                  <i className="fa fa-map-marker-alt"></i> Thêm vị trí
                </button>
              </div>
            )}

            {isLoaded && location && (
              <div className="map-preview-wrapper">
                <div className="map-preview">
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '200px', borderRadius: '8px' }}
                    center={location}
                    zoom={15}
                    options={{ disableDefaultUI: true, draggable: false }}
                  >
                    <Marker position={location} />
                  </GoogleMap>
                  <div className="map-coords">
                    <i className="fa fa-location-dot"></i>
                    <span>Tọa độ: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                  </div>
                </div>

                <div className="map-update">
                  <button type="button" className="btn btn-light" onClick={() => setShowMap(true)}>
                    <i className="fa fa-pen"></i> Cập nhật vị trí
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => {
                    setLocation(null)
                    setFormData(prev => ({ ...prev, latitude: null, longitude: null }))
                  }}>
                    <i className="fa fa-times"></i> Xóa vị trí
                  </button>
                </div>
              </div>
            )}

            <label className="checkbox">
              <input type="checkbox" name="isDefault"
                checked={formData.isDefault} onChange={handleChange} />
              <span>Đặt làm địa chỉ mặc định</span>
            </label>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Trở lại</button>
              <button type="submit" className="btn btn-primary">Hoàn thành</button>
            </div>
          </form>
        </div>
      </div>

      {showMap && (
        <div className="modal-overlay open">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <MapPicker
              initial={location}
              onSelect={(pos) => {
                setLocation(pos)
                setFormData(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }))
                setShowMap(false)
              }}
              onClose={() => setShowMap(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
