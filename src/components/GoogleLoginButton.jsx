import { useGoogleLogin } from "@react-oauth/google";
import useLogin from "../hooks/useLogin";

export default function GoogleLoginButton({ onSuccess }) {
  const { handleGoogleLogin } = useLogin();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await handleGoogleLogin(tokenResponse.credential || tokenResponse.access_token);
        onSuccess?.();
      } catch (err) {
        console.error("🔥 Lỗi Backend:", err);
      }
    },
    onError: () => {
      alert("Đăng nhập Google thất bại!");
    },
  });

  return (
    <button
      onClick={() => login()}
      style={{
        marginTop: 16,
        width: '100%',
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "0 24px",
        border: "1px solid #dadce0",
        borderRadius: 4,
        background: "white",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
        color: "#3c4043",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
      onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Đăng nhập với Google
    </button>
  );
}