import React, { createContext, useContext, useState, useCallback } from 'react'
import '../styles/components/toast.css' // Nhớ tạo file css ở bước 2

// 1. Tạo Context (cái đường dây tín hiệu)
const ToastContext = createContext()

// 2. Tạo Provider (cái trạm phát sóng)
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 3000) // Tự tắt sau 3s
  }, [removeToast])

  // Các hàm gọi tắt
  const toastValue = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toastValue}>
      {children}
      
      {/* Phần giao diện hiển thị Toast nằm luôn ở đây */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && <i className="fa fa-check-circle"></i>}
            {t.type === 'error' && <i className="fa fa-times-circle"></i>}
            {t.type === 'warning' && <i className="fa fa-exclamation-triangle"></i>}
            {t.type === 'info' && <i className="fa fa-info-circle"></i>}
            <div className="toast-content">{t.message}</div>
            <button className="toast-close" onClick={() => removeToast(t.id)}>&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// 3. Hook để dùng ở các trang khác (để ở đây luôn cho tiện import)
export const useToast = () => useContext(ToastContext)