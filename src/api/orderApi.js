import api from "./api"

const BASE_URL = "/orders"

const getUserId = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").id
  } catch {
    return null
  }
}

// helper: gỡ lớp bọc ApiResponse
const unwrap = (resData) => {
  if (!resData) return resData
  // Các dạng phổ biến:
  // 1) { result: {...} }
  // 2) { data: {...} }
  // 3) trả thẳng {...}
  return resData.result ?? resData.data ?? resData
}

export const createOrder = async (orderData) => {
  try {
    const userId = getUserId()
    if (!userId) throw new Error("Missing userId in localStorage")

    const response = await api.post(`${BASE_URL}/users/${userId}`, orderData)

    // ✅ trả về OrderResponse thật (có id, paymentCode)
    return unwrap(response.data)

  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error)
    throw error.response?.data || error
  }
}

export const getOrders = async () => {
  try {
    const userId = getUserId()
    if (!userId) throw new Error("Missing userId in localStorage")

    const response = await api.get(`${BASE_URL}/users/${userId}`)
    return unwrap(response.data)

  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng:", error)
    throw error.response?.data || error
  }
}

export const cancelOrder = async (orderId, reason) => {
  const res = await api.put(`${BASE_URL}/${orderId}/cancel`, { reason })
  return unwrap(res.data)
}
