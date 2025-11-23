import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../components/GoogleLoginButton'
import '../styles/pages/login.css'
import { register } from "../api/authApi"

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!email || !email.includes("@")) return "Email không hợp lệ"
    if (username.length < 4 || username.length > 20) return "Username phải từ 4 đến 20 ký tự"
    if (password.length < 8 || password.length > 20) return "Mật khẩu phải từ 8 đến 20 ký tự"
    if (password !== confirmPassword) return "Xác nhận mật khẩu không khớp"
    return null
  }

  const submitRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const validateError = validateForm()
    if (validateError) {
      setError(validateError)
      setLoading(false)
      return
    }

    try {
      const res = await register(email.trim(), username.trim(), password)
      // console.log(res);
      // if (res !== "register") {
      //   setError(typeof res === "string" ? res : "Đăng ký thất bại")
      //   setLoading(false)
      //   return
      // }

      navigate("/verify-otp")

    } catch (err) {
      setError(err.response?.data || err.message || "Đăng ký thất bại")
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-container">

        <div className="login-card">
          <h2 className="login-title">Đăng ký tài khoản</h2>
          <p className="muted">Tạo tài khoản mới để bắt đầu</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={submitRegister} className="login-form" autoComplete="off" noValidate>

            <label className="field">
              <div className="label">Email</div>
              <input
                type="email"
                name="new-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                autoComplete="off"
                disabled={loading}
              />
            </label>

            <label className="field">
              <div className="label">Username</div>
              <input
                type="text"
                name="new-username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Tên người dùng"
                required
                autoComplete="off"
                disabled={loading}
              />
            </label>

            <label className="field">
              <div className="label">Mật khẩu</div>
              <input
                type="password"
                name="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                disabled={loading}
              />
            </label>

            <label className="field">
              <div className="label">Xác nhận mật khẩu</div>
              <input
                type="password"
                name="new-password-confirm"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                disabled={loading}
              />
            </label>

            <button type="submit" className="btn btn-primary full" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <div className="divider">Hoặc đăng ký bằng</div>

          <GoogleLoginButton />

          <p className="register">
            Bạn đã có tài khoản?{" "}
            <a className="register-link" onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>
              Đăng nhập ngay!
            </a>
          </p>
        </div>

        <div className="login-illustration">
          <div className="illustration-content">
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="100" y="100" width="200" height="250" rx="20" fill="#fef3f3" stroke="#dc2626" strokeWidth="3" />
              <circle cx="200" cy="160" r="35" fill="#fee2e2" />
              <circle cx="200" cy="160" r="25" fill="#dc2626" opacity="0.3" />
              <path d="M 190 155 Q 200 145, 210 155" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx="195" cy="158" r="2" fill="#dc2626" />
              <circle cx="205" cy="158" r="2" fill="#dc2626" />
              <rect x="120" y="210" width="160" height="12" rx="6" fill="#fee2e2" />
              <rect x="120" y="230" width="160" height="12" rx="6" fill="#fee2e2" />
              <rect x="120" y="250" width="160" height="12" rx="6" fill="#fee2e2" />
              <rect x="130" y="280" width="140" height="35" rx="10" fill="#dc2626" />
              <rect x="160" y="292" width="80" height="10" rx="3" fill="#fff" />
              <circle cx="340" cy="120" r="25" fill="#10b981" opacity="0.2" />
              <path d="M 330 120 L 337 127 L 350 113" stroke="#10b981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="70" cy="150" r="20" fill="#0ea5e9" opacity="0.1" />
              <circle cx="350" cy="280" r="30" fill="#fbbf24" opacity="0.15" />
              <circle cx="80" cy="320" r="25" fill="#dc2626" opacity="0.1" />
              <path d="M 60 220 Q 80 200, 100 220" stroke="#0ea5e9" strokeWidth="3" fill="none" opacity="0.3" />
              <path d="M 320 180 Q 340 160, 360 180" stroke="#dc2626" strokeWidth="3" fill="none" opacity="0.3" />
              <path d="M 320 320 Q 340 300, 360 320" stroke="#10b981" strokeWidth="3" fill="none" opacity="0.3" />
            </svg>
          </div>
        </div>

      </div>
    </main>
  )
}
