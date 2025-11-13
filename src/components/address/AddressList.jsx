import React from 'react'
import '../../styles/components/address/address-list.css'

export default function AddressList({ addresses, onEdit, onDelete, onDefault }) {
  return (
    <div className="address-list">
      {addresses.map(a => (
        <div key={a.id} className="address-item">
          <div className="address-main">
            <div className="address-name">
              <strong>{a.fullName}</strong>
              <span className="divider">|</span>
              <span>{a.phoneNumber}</span>
              {a.isDefault && <span className="badge-default">Mặc định</span>}
            </div>

            <div className="address-text">
              {[a.addressDetail, a.ward, a.district, a.province]
                .filter(Boolean)
                .join(', ')}
            </div>
          </div>

          <div className="address-actions">
            <button className="link" onClick={() => onEdit(a)}>Cập nhật</button>
            <button className="link" onClick={() => onDelete(a.id)}>Xóa</button>

            {!a.isDefault && (
              <button className="btn-light" onClick={() => onDefault(a.id)}>
                Thiết lập mặc định
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
