import React, { useState, useEffect } from 'react'
import AddressList from '../address/AddressList'
import AddressForm from '../address/AddressForm'
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
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAddresses()
        setAddresses(res || [])
      } catch (err) {
        setError("Không thể tải danh sách địa chỉ. Vui lòng thử lại.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleEdit = (address) => {
    setEditing(address)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa địa chỉ này?')) return
    try {
      const res = await deleteAddress(id)
      setAddresses(prev =>
        prev.filter(a => a.id !== id).map(a => ({
          ...a,
          isDefault: a.id === res.defaultAddressId
        }))
      )
    } catch (err) {}
  }

  const handleDefault = async (id) => {
    try {
      await setDefaultAddress(id)
      setAddresses(prev =>
        prev.map(a => ({ ...a, isDefault: a.id === id }))
      )
    } catch {}
  }

  const handleAddNew = () => {
    setEditing(null)
    setShowForm(true)
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
            return [...prev.map(a => ({ ...a, isDefault: false })), created]
          }
          return [...prev, created]
        })
      }
      setShowForm(false)
    } catch {}
  }

  if (loading) {
    return (
      <div className="address-book">
        <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="address-book">
        <div style={{ textAlign: 'center', padding: 40, color: 'red' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="address-book">
      <div className="address-header">
        <h3>Địa chỉ của tôi</h3>
        <button className="btn btn-primary" onClick={handleAddNew}>
          Thêm địa chỉ
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="empty-state">Bạn chưa có địa chỉ nào.</div>
      ) : (
        <AddressList
          addresses={addresses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDefault={handleDefault}
        />
      )}

      {showForm && (
        <AddressForm
          initial={editing}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
