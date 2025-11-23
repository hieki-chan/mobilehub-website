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



export const getUserProfile = async () => {
  try {
    // Endpoint này tùy thuộc vào Backend của bạn, thường là /users/my-info hoặc /auth/me
    // Tôi đang giả định là /users/my-info theo chuẩn RESTful
    const res = await api.get('/users/my-info'); 
    return res.data.result; // Giả định API trả về { result: { ...user } }
  } catch (err) {
    console.error("Lấy thông tin thất bại:", err);
    return null;
  }
};

export const updateProfile = async (userData) => {
  try {
    // Backend thường nhận JSON hoặc Multipart nếu có file ảnh
    // Ở đây ta gửi JSON trước
    const res = await api.put('/users/update', userData);
    
    // Nếu cập nhật thành công, cập nhật lại localStorage nếu cần
    if (res.data?.result) {
        const user = res.data.result;
        if (user.email) localStorage.setItem("email", user.email);
    }
    
    return res.data;
  } catch (err) {
    console.error("Cập nhật thất bại:", err);
    return null;
  }
};

export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await api.post('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.result; // Trả về URL ảnh mới
  } catch (err) {
    console.error("Upload ảnh lỗi:", err);
    return null;
  }
}

export const loginWithGoogle = async (idToken) => {
  try {
    const res = await api.post(`${API_BASE_URL}/google`, { idToken });
    const data = res.data;

    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("email", data.user.email);
    localStorage.setItem("isLoggedIn", "true");

    return data;
  } catch (err) {
    console.error("Google login failed:", err);
    throw err;
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
