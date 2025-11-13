import api from "./api" // đường dẫn đúng tới file api.js bạn đã tạo

const BASE_URL = "/carts";

export const createOrder = async (orderData) => {
  try {
    const response = await api.post(`/${BASE_URL}`, orderData)
    return response.data
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error)
    throw error.response?.data || error
  }
}

