import api from "./api"

const BASE_URL = "/orders"

const getUserId = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").id
  } catch {
    return null
  }
}

export const createOrder = async (orderData) => {
  try {
    const userId = getUserId()
    const response = await api.post(`${BASE_URL}/users/${userId}`, orderData)
    return response.data
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error)
    throw error.response?.data || error
  }
}
