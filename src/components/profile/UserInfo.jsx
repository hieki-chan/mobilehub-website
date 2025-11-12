import React, { useState } from 'react'
import '../../styles/components/profile/user-info.css'

export default function UserInfo({ user, onUpdateUser }) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên'
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ'
    }
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const updatedUser = { ...user, ...formData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    window.dispatchEvent(new Event('user-changed'))
    onUpdateUser(updatedUser)
    setEditing(false)
    alert('Cập nhật thông tin thành công!')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>Thông tin tài khoản</h3>
        {!editing && (
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>
            <i className="fa fa-edit"></i> Chỉnh sửa
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <label className="field">
          <div className="label">Họ tên <span className="required">*</span></div>
          <input 
            type="text" 
            name="name"
            value={formData.name} 
            onChange={handleChange}
            disabled={!editing}
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </label>

        <label className="field">
          <div className="label">Email <span className="required">*</span></div>
          <input 
            type="email" 
            name="email"
            value={formData.email} 
            onChange={handleChange}
            disabled={!editing}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </label>

        <label className="field">
          <div className="label">Số điện thoại</div>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone} 
            onChange={handleChange}
            placeholder="0912345678"
            disabled={!editing}
          />
          {errors.phone && <div className="field-error">{errors.phone}</div>}
        </label>

        <label className="field">
          <div className="label">Địa chỉ</div>
          <textarea 
            name="address"
            value={formData.address} 
            onChange={handleChange}
            placeholder="Nhập địa chỉ của bạn"
            rows="3"
            disabled={!editing}
          />
        </label>

        {editing && (
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-save"></i> Lưu thay đổi
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => {
                setFormData({
                  name: user.name || '',
                  email: user.email || '',
                  phone: user.phone || '',
                  address: user.address || ''
                })
                setErrors({})
                setEditing(false)
              }}
            >
              Hủy
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
