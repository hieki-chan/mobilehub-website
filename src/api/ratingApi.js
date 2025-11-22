import api from "./api";

const BASE_URL = "/ratings";

export const getUserId = () =>
  JSON.parse(localStorage.getItem("user") || "{}").id

export async function createRating({ productId, stars, comment }) {
  const res = await api.post(`${BASE_URL}`, {
    productId,
    userId: getUserId(),
    stars,
    comment
  });
  return res.data;
}

export async function updateRating({ ratingId, stars, comment }) {
  const res = await api.put(`${BASE_URL}`, {
    ratingId,
    stars,
    comment
  });
  return res.data;
}

export const getProductRating = async (productId) => {
  try {
    const res = await api.get(`${BASE_URL}/products`, {
      params: { userId: getUserId(), productId }
    });

    return res.data;
  }
  catch {
    return null;
  }
};

export const getRatingsByProduct = async ({ productId, page = 0, size = 10, sort }) => {
  const res = await api.get(`${BASE_URL}/by-product`, {
    params: { productId, page, size, sort }
  })
  //console.log(res.data);
  return res.data;
}