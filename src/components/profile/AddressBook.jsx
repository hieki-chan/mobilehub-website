import React, { useState, useEffect } from 'react'
import AddressForm from './AddressForm'
import {
  getAddresses,
  createAddress,
  setDefaultAddress,
  updateAddress,
  deleteAddress
} from '../../api/addressApi'
import '../../styles/components/profile/address-book.css'

export default function AddressBook() {
  const [addresses, setAddresses] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAddresses()
        setAddresses(res || [])
      } catch (err) {
        console.error('Lỗi tải địa chỉ:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleAddNew = () => {
    setEditing(null)
    setShowForm(true)
  }

  const handleEdit = (address) => {
    setEditing(address)
    setShowForm(true)
  }

  const handleDefault = async (id) => {
    try {
      await setDefaultAddress(id)

      setAddresses(prev =>
        prev.map(a => ({
          ...a,
          isDefault: a.id === id
        }))
      )
    } catch (err) {
      console.error('Lỗi cập nhật địa chỉ mặc định:', err)
    }
  }

  const handleSave = async (data) => {
    try {
      if (editing) {
        const updated = await updateAddress(editing.id, data)

        setAddresses(prev => {
          if (updated.isDefault) {
            return prev.map(a =>
              a.id === updated.id
                ? { ...updated, isDefault: true }
                : { ...a, isDefault: false }
            )
          }

          return prev.map(a => (a.id === editing.id ? updated : a))
        })

      } else {
        const created = await createAddress(data)
        setAddresses(prev => {
          if (created.isDefault) {
            return [
              ...prev.map(a => ({ ...a, isDefault: false })),
              created
            ]
          }
          return [...prev, created]
        })
      }

      setShowForm(false)

    } catch (err) {
      console.error('Lỗi lưu địa chỉ:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa địa chỉ này?')) return
    try {
      const res = await deleteAddress(id)
      setAddresses(prev =>
        prev
          .filter(a => a.id !== id)
          .map(a => ({
            ...a,
            isDefault: a.id === res.defaultAddressId
          }))
      )

    } catch (err) {
      console.error('Lỗi xóa địa chỉ:', err)
    }
  }

  if (loading) {
    return (
      <div className="address-book">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa fa-spinner fa-spin"></i> Đang tải địa chỉ...
        </div>
      </div>
    )
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
          {addresses.map((a) => (
            <div key={a.id} className="address-item">
              <div className="address-main">
                <div className="address-name">
                  <strong>{a.fullName}</strong>
                  <span className="divider">|</span>
                  <span>{a.phoneNumber}</span>
                  {a.isDefault && <span className="badge-default">Mặc định</span>}
                </div>
                <div className="address-text">
                  {[a.addressDetail, a.ward, a.district, a.province].filter(Boolean).join(', ')}
                </div>
              </div>
              <div className="address-actions">
                <button className="link" onClick={() => handleEdit(a)}>Cập nhật</button>
                <button className="link" onClick={() => handleDelete(a.id)}>Xóa</button>
                {!a.isDefault && (
                  <>
                    <button className="btn btn-light" onClick={() => handleDefault(a.id)}>
                      Thiết lập mặc định
                    </button>
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
          onSave={handleSave}
          initial={editing}
        />
      )}
    </div>
  )
}
