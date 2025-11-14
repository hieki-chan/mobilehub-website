import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/login.css";
import { verifyOtp, resendOtp } from "../api/authApi";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("pendingEmail");
    if (!savedEmail) {
      navigate("/register");
      return;
    }
    setEmail(savedEmail);
  }, [navigate]);

  const submitVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await verifyOtp(otp.trim());
      if (res?.result) {
        localStorage.removeItem("pendingEmail");
        navigate("/login");
      } else {
        setError(res?.message || "OTP không hợp lệ");
      }
    } catch (err) {
      setError(err.response?.data || err.message || "Xác thực thất bại");
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await resendOtp();
      setMessage("OTP mới đã được gửi lại vào email");
    } catch (err) {
      setError(err.response?.data || err.message || "Không thể gửi lại OTP");
    }

    setLoading(false);
  };

  return (
    <main className="login-page">
      <div className="login-container">

        <div className="login-card">
          <h2 className="login-title">Xác thực OTP</h2>
          <p className="muted">Một mã OTP đã được gửi đến email {email}</p>

          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}

          <form onSubmit={submitVerify} className="login-form" autoComplete="off" noValidate>
            <label className="field">
              <div className="label">Mã OTP</div>
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP"
                required
                disabled={loading}
                autoComplete="off"
              />
            </label>

            <button type="submit" className="btn btn-primary full" disabled={loading}>
              {loading ? "Đang xác thực..." : "Xác thực OTP"}
            </button>
          </form>

          <button className="btn btn-secondary full mt-2" onClick={handleResend} disabled={loading}>
            Gửi lại OTP
          </button>

          <p className="register mt-2">
            Sai email?{" "}
            <a className="register-link" onClick={() => navigate("/register")} style={{ cursor: "pointer" }}>
              Quay lại đăng ký
            </a>
          </p>
        </div>

        <div className="login-illustration">
          <div className="illustration-content">
            {/* SVG giữ nguyên style register để đồng bộ UI */}
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="100" y="100" width="200" height="250" rx="20" fill="#eff6ff" stroke="#2563eb" strokeWidth="3"/>
              <circle cx="200" cy="160" r="35" fill="#dbeafe"/>
              <circle cx="200" cy="160" r="25" fill="#2563eb" opacity="0.3"/>
              <rect x="120" y="230" width="160" height="12" rx="6" fill="#dbeafe"/>
              <rect x="130" y="270" width="140" height="35" rx="10" fill="#2563eb"/>
              <rect x="160" y="282" width="80" height="10" rx="3" fill="#fff"/>
              <circle cx="340" cy="120" r="25" fill="#10b981" opacity="0.2"/>
            </svg>
          </div>
        </div>

      </div>
    </main>
  );
}
