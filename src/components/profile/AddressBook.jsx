import React, { useState, useEffect } from 'react'
import AddressForm from './AddressForm'
import '../../styles/components/profile/address-book.css'

export default function AddressBook() {
  const [addresses, setAddresses] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ fullName: '', phone: '', address: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('addresses') || '[]')
    setAddresses(stored)
  }, [])

  const saveToStorage = (list) => {
    localStorage.setItem('addresses', JSON.stringify(list))
    setAddresses(list)
  }

  const handleAddNew = () => {
    setForm({ fullName: '', phone: '', address: '' })
    setEditing(null)
    setShowForm(true)
  }

  const handleEdit = (idx) => {
    setForm(addresses[idx])
    setEditing(idx)
    setShowForm(true)
  }

  const handleDelete = (idx) => {
    if (!window.confirm('Xóa địa chỉ này?')) return
    const updated = addresses.filter((_, i) => i !== idx)
    saveToStorage(updated)
  }

  const handleDefault = (idx) => {
    const updated = addresses.map((a, i) => ({ ...a, isDefault: i === idx }))
    saveToStorage(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin!')
      return
    }
    let updated
    if (editing !== null) {
      updated = addresses.map((a, i) => i === editing ? { ...a, ...form } : a)
    } else {
      updated = [...addresses, { ...form, isDefault: addresses.length === 0 }]
    }
    saveToStorage(updated)
    setShowForm(false)
  }

  return (
    <div className="address-book">
      <div className="address-header">
        <h3>Địa chỉ của tôi</h3>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <i className="fa fa-plus"></i> Thêm địa chỉ mới
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="empty-state">
          <i className="fa fa-map-marker-alt"></i>
          <div>Bạn chưa có địa chỉ nào</div>
        </div>
      ) : (
        <div className="address-list">
          {addresses.map((a, idx) => (
            <div key={idx} className="address-item">
              <div className="address-main">
                <div className="address-name">
                  <strong>{a.fullName}</strong>
                  <span className="divider">|</span>
                  <span>{a.phone}</span>
                  {a.isDefault && <span className="badge-default">Mặc định</span>}
                </div>
                <div className="address-text">{a.address}</div>
              </div>
              <div className="address-actions">
                <button className="link" onClick={() => handleEdit(idx)}>Cập nhật</button>
                {!a.isDefault && (
                  <>
                    <button className="link" onClick={() => handleDelete(idx)}>Xóa</button>
                    <button className="btn btn-light" onClick={() => handleDefault(idx)}>Thiết lập mặc định</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddressForm
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            let updated
            if (editing !== null) {
              updated = addresses.map((a, i) => i === editing ? data : a)
            } else {
              updated = [...addresses, { ...data, isDefault: addresses.length === 0 }]
            }
            localStorage.setItem('addresses', JSON.stringify(updated))
            setAddresses(updated)
            setShowForm(false)
          }}
          initial={editing !== null ? addresses[editing] : null}
        />
      )}
    </div>
  )
}
