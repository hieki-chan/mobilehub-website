import React, { useState, useEffect } from 'react'
import MapPicker from '../map/MapPicker'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import '../../styles/components/profile/address-form.css'

export default function AddressForm({ onClose, onSave, initial }) {
    const [cities, setCities] = useState([])
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])
    const [showMap, setShowMap] = useState(false)
    const [location, setLocation] = useState(initial?.location || null)
    const [errors, setErrors] = useState({})

    const [formData, setFormData] = useState(initial || {
        fullName: '',
        phone: '',
        cityCode: '',
        districtCode: '',
        wardCode: '',
        address: '',
        type: 'home',
        isDefault: false,
        latitude: null,
        longitude: null
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
        setDistricts([]); setWards([])
        setFormData(prev => ({ ...prev, districtCode: '', wardCode: '' }))
        if (!formData.cityCode) return
        fetch(`https://provinces.open-api.vn/api/p/${formData.cityCode}?depth=2`)
            .then(res => res.json())
            .then(data => setDistricts(data.districts))
    }, [formData.cityCode])

    useEffect(() => {
        setWards([])
        setFormData(prev => ({ ...prev, wardCode: '' }))
        if (!formData.districtCode) return
        fetch(`https://provinces.open-api.vn/api/d/${formData.districtCode}?depth=2`)
            .then(res => res.json())
            .then(data => setWards(data.wards))
    }, [formData.districtCode])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên'
        else if (formData.fullName.length > 50) newErrors.fullName = 'Họ tên quá dài (tối đa 50 ký tự)'
        if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại'
        else if (!/^[0-9]{10,11}$/.test(formData.phone.trim())) newErrors.phone = 'Số điện thoại không hợp lệ'
        if (!formData.cityCode) newErrors.cityCode = 'Chọn Tỉnh/Thành phố'
        if (!formData.districtCode) newErrors.districtCode = 'Chọn Quận/Huyện'
        if (!formData.wardCode) newErrors.wardCode = 'Chọn Phường/Xã'
        if (!formData.address.trim()) newErrors.address = 'Nhập địa chỉ cụ thể'
        else if (formData.address.length > 200) newErrors.address = 'Địa chỉ quá dài (tối đa 200 ký tự)'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return

        const city = cities.find(c => c.code === formData.cityCode)
        const district = districts.find(d => d.code === formData.districtCode)
        const ward = wards.find(w => w.code === formData.wardCode)

        onSave({
            ...formData,
            cityName: city?.name || '',
            districtName: district?.name || '',
            wardName: ward?.name || ''
        })
    }

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal address-form-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div className="modal-body">
                    <h3>{initial ? 'Cập nhật địa chỉ' : 'Địa chỉ mới'}</h3>
                    <form className="address-add-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="field">
                                <input name="fullName" placeholder="Họ và tên" value={formData.fullName} onChange={handleChange} />
                                {errors.fullName && <div className="field-error">{errors.fullName}</div>}
                            </div>
                            <div className="field">
                                <input name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} />
                                {errors.phone && <div className="field-error">{errors.phone}</div>}
                            </div>
                        </div>

                        <div className="field">
                            <select name="cityCode" value={formData.cityCode} onChange={handleChange}>
                                <option value="">Chọn Tỉnh/Thành phố</option>
                                {cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                            </select>
                            {errors.cityCode && <div className="field-error">{errors.cityCode}</div>}
                        </div>

                        <div className="field">
                            <select name="districtCode" value={formData.districtCode} onChange={handleChange} disabled={!districts.length}>
                                <option value="">Chọn Quận/Huyện</option>
                                {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                            </select>
                            {errors.districtCode && <div className="field-error">{errors.districtCode}</div>}
                        </div>

                        <div className="field">
                            <select name="wardCode" value={formData.wardCode} onChange={handleChange} disabled={!wards.length}>
                                <option value="">Chọn Phường/Xã</option>
                                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                            </select>
                            {errors.wardCode && <div className="field-error">{errors.wardCode}</div>}
                        </div>

                        <div className="field">
                            <input name="address" placeholder="Địa chỉ cụ thể" value={formData.address} onChange={handleChange} />
                            {errors.address && <div className="field-error">{errors.address}</div>}
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
                            <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
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
                <div className="modal-overlay open" onClick={() => setShowMap(false)}>
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
