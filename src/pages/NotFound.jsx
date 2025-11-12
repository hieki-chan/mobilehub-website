// src/pages/NotFound.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/pages/notfound.css'

export default function NotFound() {
  const navigate = useNavigate()
  const location = useLocation()
  const [countdown, setCountdown] = useState(10)

  // Auto redirect về home sau 10s
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  // Get error message nếu có từ navigate state
  const errorMessage = location.state?.message || 'Trang bạn tìm kiếm không tồn tại'

  return (
    <div className="notfound-page">
      <div className="notfound-container">
        {/* Animated 404 */}
        <div className="error-code">
          <span className="four">4</span>
          <span className="zero">
            <svg width="120" height="120" viewBox="0 0 120 120" className="phone-svg">
              <circle cx="60" cy="60" r="50" fill="#fee2e2" />
              <rect x="35" y="20" width="50" height="80" rx="8" fill="#dc2626" />
              <rect x="40" y="28" width="40" height="60" rx="4" fill="#fff" />
              <circle cx="60" cy="95" r="3" fill="#dc2626" />
              {/* Crack effect */}
              <line x1="50" y1="40" x2="70" y2="70" stroke="#fca5a5" strokeWidth="2" />
              <line x1="45" y1="55" x2="65" y2="50" stroke="#fca5a5" strokeWidth="1.5" />
            </svg>
          </span>
          <span className="four">4</span>
        </div>

        {/* Error Message */}
        <h1 className="error-title">Oops! Có lỗi xảy ra</h1>
        <p className="error-message">{errorMessage}</p>

        {/* Suggestions */}
        <div className="suggestions">
          <h3>Có thể bạn đang tìm:</h3>
          <div className="suggestion-links">
            <button 
              className="suggestion-btn"
              onClick={() => navigate('/')}
            >
              <i className="fa fa-home"></i>
              Trang chủ
            </button>
            <button 
              className="suggestion-btn"
              onClick={() => navigate('/search?q=iPhone')}
            >
              <i className="fa fa-mobile"></i>
              Sản phẩm
            </button>
            <button 
              className="suggestion-btn"
              onClick={() => navigate('/cart')}
            >
              <i className="fa fa-shopping-cart"></i>
              Giỏ hàng
            </button>
            <button 
              className="suggestion-btn"
              onClick={() => navigate('/profile')}
            >
              <i className="fa fa-user"></i>
              Tài khoản
            </button>
          </div>
        </div>

        {/* Auto redirect countdown */}
        <div className="countdown">
          Tự động chuyển về trang chủ sau <strong>{countdown}s</strong>
        </div>

        {/* Help text */}
        <p className="help-text">
          Nếu vấn đề vẫn tiếp diễn, vui lòng{' '}
          <a href="mailto:support@mobilehub.com">liên hệ hỗ trợ</a>
        </p>
      </div>
    </div>
  )
}