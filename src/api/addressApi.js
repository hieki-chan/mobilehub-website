import api from "./api" 

const BASE_URL = "/customers"

export const createAddress = async (addressData) => {
  try {
    //console.log(addressData)
    const response = await api.post(`${BASE_URL}/addresses`, addressData)
    return response.data
  } catch (error) {
    console.error("Lỗi khi tạo địa chỉ:", error)
    throw error.response?.data || error
  }
}


export const getAddresses = async () => {
  try {
    const response = await api.get(`${BASE_URL}/addresses`)
    return response.data
  } catch (error) {
    console.error("Lỗi khi tải danh sách địa chỉ:", error)
    throw error.response?.data || error
  }
}

export const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.put(`${BASE_URL}/addresses/${addressId}/default`)
    return response.data
  } catch (error) {
    console.error("Lỗi khi đặt địa chỉ mặc định:", error)
    throw error.response?.data || error
  }
}

export const updateAddress = async (addressId, data) => {
  try {
    console.log(data)
    const response = await api.put(`/customers/addresses/${addressId}`, data)
    return response.data
  } catch (error) {
    console.error("Lỗi khi cập nhật địa chỉ:", error)
    throw error.response?.data || error
  }
}

export const deleteAddress = async (addressId) => {
  try {
    const response = await api.delete(`/customers/addresses/${addressId}`)
    return response.data       // { defaultAddressId: ... }
  } catch (error) {
    console.error("Lỗi khi xóa địa chỉ:", error)
    throw error.response?.data || error
  }
}
