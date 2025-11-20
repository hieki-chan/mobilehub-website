import api from "./api";

const BASE_URL = "/customers";

export const verifyCCCD = async (frontFile, backFile) => {
  const formData = new FormData();
  formData.append("frontImage", frontFile);
  // nếu cần backFile thì uncomment
  // formData.append("backImage", backFile);

  try {
    const response = await api.post(`${BASE_URL}/verify`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Response CCCD:", response.data);
    return response.data;
  } catch (err) {
    console.error("Lỗi verify CCCD:", err.response?.data || err.message);
    throw err;
  }
};

export const getVerificationStatus = async () => {
  try {
    const response = await api.get(`${BASE_URL}/verification-status`);
    console.log("User verification status:", response.data);
    return response.data;
  } catch (err) {
    console.error("Lỗi lấy trạng thái verification:", err.response?.data || err.message);
    throw err;
  }
};