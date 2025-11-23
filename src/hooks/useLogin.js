import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useToast } from '../components/ToastProvider'

export default function useLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const handleLogin = async ({ email, password, remember = true }) => {
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      if (remember) localStorage.setItem("email", email);
      else localStorage.removeItem("email");

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Đăng nhập thành công!");

      navigate("/");
      window.dispatchEvent(new Event("user-changed"));
    } catch (err) {
      let msg = "";
      if (!err.response)
        msg = "Không thể kết nối đến máy chủ. Kiểm tra mạng hoặc thử lại sau.";
      else if (err.response.status === 401)
        msg = "Sai email hoặc mật khẩu!";
      else if (err.response.status === 403)
        msg = "Tài khoản này không có quyền truy cập.";
      else if (err.response.status >= 500)
        msg = "Lỗi máy chủ. Vui lòng thử lại sau.";
      else msg = "Đăng nhập thất bại. Vui lòng thử lại.";

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}
