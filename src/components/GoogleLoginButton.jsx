import { GoogleLogin } from "@react-oauth/google";
import useLogin from "../hooks/useLogin";

export default function GoogleLoginButton({ onSuccess }) {
  const { handleGoogleLogin } = useLogin(); // ← PHẢI GỌI HOOK TRONG COMPONENT

  const handleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      await handleGoogleLogin(token); // ← THÊM AWAIT
      onSuccess?.();
    } catch (err) {
      console.error("🔥 Lỗi Backend:", err);
    }
  };

  const handleError = () => {
    alert("Đăng nhập Google thất bại!");
  };

  return (
    <div style={{ marginTop: 16 }}>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} text="signin_with" shape="pill" />
    </div>
  );
}