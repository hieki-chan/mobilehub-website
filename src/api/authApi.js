import api from "./api";

const API_BASE_URL = "/auth";

export const register = async (email, username, password) => {
  try {
    const res = await api.post(`${API_BASE_URL}/register`, {
      email,
      username,
      password
    });

    localStorage.setItem("pendingEmail", email);

    return res.data;
  } catch (err) {
    console.error("Register failed:", err);
    throw err;
  }
};

export const verifyOtp = async (otp) => {
  try {
    const email = localStorage.getItem("pendingEmail");
    if (!email) throw new Error("Không tìm thấy email tạm. Vui lòng đăng ký lại.");

    const res = await api.post(`${API_BASE_URL}/verify`, {
      email,
      otp
    });

    if (res?.data?.result) {
      localStorage.removeItem("pendingEmail");
    }

    return res.data;
  } catch (err) {
    console.error("Verify OTP failed:", err);
    throw err;
  }
};

export const resendOtp = async () => {
  try {
    const email = localStorage.getItem("pendingEmail");
    if (!email) throw new Error("Không tìm thấy email tạm. Vui lòng đăng ký lại.");

    const res = await api.post(`${API_BASE_URL}/resend-otp`, {
      email
    });

    return res.data;
  } catch (err) {
    console.error("Resend OTP failed:", err);
    throw err;
  }
};

export const login = async (email, password) => {
  try {
    const res = await api.post(`${API_BASE_URL}/authenticate`, { email, password });
    const data = res.data;

    if (!data?.user || data.user.role !== "USER") {
      throw new Error("Tài khoản này không có quyền đăng nhập!");
    }

    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("email", data.user.email);
    localStorage.setItem("isLoggedIn", "true");

    return data;
  } catch (err) {
    console.error("❌ Login failed:", err);
    throw err;
  }
};

export const verifyToken = async (token) => {
  const res = await api.get(`${API_BASE_URL}/validate`, { params: { token } });

  if (res.data === "Valid") return true;

  return false;
};

export const forgotPassword = async (email) => {
  const res = await api.post(`${API_BASE_URL}/forgot-password`, { email })

  if (res.data === "OK") return true;

  return false;
};

export const validateResetToken = async (token) => {
  try {
    const res = await api.get(`${API_BASE_URL}/reset-password/validate`, {
      params: { token }
    });

    return true;
  } catch (err) {
    return false;
  }
};

export const resetPassword = async (newPassword, token) => {
  try {
    console.log({
      newPassword,
      token
    })
    const res = await api.post(`${API_BASE_URL}/reset-password`, {
      newPassword,
      jwtResetToken: token
    });

    return true;
  } catch (err) {
    return false;
  }
};

export const logout = () => {
  clearAccountData();
};

export const clearAccountData = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("username");
  localStorage.removeItem("user");
};
