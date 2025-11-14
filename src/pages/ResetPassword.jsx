import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { validateResetToken, resetPassword } from "../api/authApi";
import "../styles/pages/login.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlToken = new URLSearchParams(location.search).get("token");

    if (!urlToken) {
      navigate("/forgot-password");
      return;
    }

    async function parse() {
      const result = await validateResetToken(urlToken);

      if (!result) {
        navigate("/forgot-password");
        return;
      }

      setToken(urlToken);
      setLoading(false);
    }

    parse();
  }, [location.search, navigate]);

  const submitReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Mật khẩu phải ít nhất 8 ký tự");
      return;
    }

    if (password !== confirm) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }

    const ok = await resetPassword(password, token);

    if (!ok) {
      setError("Không thể đổi mật khẩu. Link có thể đã hết hạn.");
      return;
    }

    setSuccess("Đổi mật khẩu thành công");
    setTimeout(() => navigate("/login"), 1200);
  };

  if (loading) {
    return (
      <main className="login-page">
        <div className="login-container">
          <div className="login-card"><h2>Đang kiểm tra liên kết...</h2></div>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <div className="login-container">

        <div className="login-card">
          <h2 className="login-title">Đặt lại mật khẩu</h2>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <form onSubmit={submitReset} className="login-form" autoComplete="off">

            <label className="field">
              <div className="label">Mật khẩu mới</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
              />
            </label>

            <label className="field">
              <div className="label">Xác nhận mật khẩu</div>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </label>

            <button type="submit" className="btn btn-primary full">
              Đổi mật khẩu
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
