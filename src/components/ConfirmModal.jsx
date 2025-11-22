import React from 'react'
import '../styles/components/modal.css'

/**
 * ConfirmModal - Popup xác nhận chung
 * @param {boolean} isOpen - Trạng thái hiển thị
 * @param {string} title - Tiêu đề popup
 * @param {string} message - Nội dung thông báo
 * @param {function} onConfirm - Hàm chạy khi bấm Xác nhận/Đồng ý
 * @param {function} onClose - Hàm chạy khi bấm Hủy/Đóng
 * @param {string} confirmText - Text nút xác nhận (mặc định: Xác nhận)
 * @param {string} cancelText - Text nút hủy (mặc định: Hủy)
 * @param {boolean} isDanger - Nếu true, nút xác nhận sẽ màu đỏ (dùng cho xóa/đăng xuất)
 */
export default function ConfirmModal({ 
  isOpen, 
  title = "Xác nhận", 
  message, 
  onConfirm, 
  onClose,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isDanger = false
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '400px', padding: '24px', textAlign: 'center' }} // Custom style cho gọn
      >
        <button className="modal-close" onClick={onClose} style={{top: '8px', right: '8px'}}>&times;</button>
        
        <h3 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text)' }}>
          {title}
        </h3>
        
        <p className="muted" style={{ marginBottom: '24px', fontSize: '15px', lineHeight: '1.5' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ minWidth: '100px' }}
          >
            {cancelText}
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={onConfirm}
            style={{ 
              minWidth: '100px', 
              backgroundColor: isDanger ? '#dc2626' : 'var(--brand-primary)' 
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}