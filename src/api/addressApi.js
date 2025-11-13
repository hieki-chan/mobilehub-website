import api from "./api" 

export const getUserId = () =>
  JSON.parse(localStorage.getItem("user") || "{}").id

const BASE_URL = "/customers"

export const createAddress = async (addressData) => {
  try {
    //console.log(addressData)
    const userId = getUserId()
    const response = await api.post(`${BASE_URL}/${userId}/addresses`, addressData)
    return response.data
  } catch (error) {
    console.error("Lỗi khi tạo địa chỉ:", error)
    throw error.response?.data || error
  }
}

export const getAddresses = async () => {
  try {
    const userId = getUserId()
    const response = await api.get(`${BASE_URL}/${userId}/addresses`)
    return response.data
  } catch (error) {
    console.error("Lỗi khi tải danh sách địa chỉ:", error)
    throw error.response?.data || error
  }
}

export const getDefaultAddress = async () => {
  try {
    const userId = getUserId()
    const response = await api.get(`${BASE_URL}/${userId}/addresses/default`)
    return response.data
  } catch (error) {
    console.error("Lỗi khi lấy địa chỉ mặc định:", error)
    throw error.response?.data || error
  }
}

export const setDefaultAddress = async (addressId) => {
  try {
    const userId = getUserId()
    const response = await api.put(`${BASE_URL}/${userId}/addresses/${addressId}/default`)
    return response.data
  } catch (error) {
    console.error("Lỗi khi đặt địa chỉ mặc định:", error)
    throw error.response?.data || error
  }
}

export const updateAddress = async (addressId, data) => {
  try {
    //console.log(data)
    const userId = getUserId()
    const response = await api.put(`${BASE_URL}/${userId}/addresses/${addressId}`, data)
    return response.data
  } catch (error) {
    console.error("Lỗi khi cập nhật địa chỉ:", error)
    throw error.response?.data || error
  }
}

export const deleteAddress = async (addressId) => {
  try {
    const userId = getUserId()
    const response = await api.delete(`${BASE_URL}/${userId}/addresses/${addressId}`)
    return response.data       // { defaultAddressId: ... }
  } catch (error) {
    console.error("Lỗi khi xóa địa chỉ:", error)
    throw error.response?.data || error
  }
}
