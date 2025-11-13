import React, { useEffect, useState } from 'react'
import AddressForm from './AddressForm'
import {
    getAddresses,
    createAddress,
    updateAddress
} from '../../api/addressApi'
import '../../styles/components/address/address-popup.css'

export default function AddressPopup({ onClose, onSelect, selectedId }) {
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getAddresses()
                setAddresses(res || [])
            } catch { }
            finally { setLoading(false) }
        }
        fetch()
    }, [])

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
            setEditing(null)

        } catch { }
    }

    const handleSelect = (addr) => {
        onSelect(addr)
    }

    return (
        <div className="addr-popup-overlay">
            <div className="addr-popup-box">

                <div className="addr-popup-header">
                    <h3>Địa Chỉ Của Tôi</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {showForm ? (
                    <AddressForm
                        initial={editing}
                        onSave={handleSave}
                        onClose={() => {
                            setEditing(null)
                            setShowForm(false)
                        }}
                    />
                ) : (
                    <div className="addr-popup-body">
                        {loading ? (
                            <div className="loading">Đang tải...</div>
                        ) : (
                            <>
                                <button
                                    className="addr-add-btn"
                                    onClick={() => {
                                        setEditing(null)
                                        setShowForm(true)
                                    }}
                                >
                                    + Thêm Địa Chỉ Mới
                                </button>

                                {addresses.map(a => (
                                    <div key={a.id} className="addr-popup-item">

                                        <input
                                            type="radio"
                                            className="addr-radio"
                                            name="addr"
                                            checked={a.id === selectedId}
                                            onChange={() => handleSelect(a)}
                                        />

                                        <div className="addr-info" onClick={() => handleSelect(a)}>
                                            <div className="name">
                                                {a.fullName} | {a.phoneNumber}
                                                {a.isDefault && (
                                                    <span className="default-badge">Mặc định</span>
                                                )}
                                            </div>

                                            <div className="text">
                                                {[a.addressDetail, a.ward, a.district, a.province]
                                                    .filter(Boolean).join(', ')}
                                            </div>
                                        </div>

                                        <div
                                            className="addr-update"
                                            onClick={() => {
                                                setEditing(a)
                                                setShowForm(true)
                                            }}
                                        >
                                            Cập nhật
                                        </div>

                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
