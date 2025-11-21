import api from "./api";

const BASE_URL = "/products";

export const fetchProducts = async (page = 0, size = 8) => {
  const res = await api.get(`${BASE_URL}?page=${page}&size=${size}`);
  //console.log(res);
  return res.data;
};

export const getProductDetails = async (productId) => {
  const res = await api.get(`${BASE_URL}/${productId}/details`);
  //console.log(res.data);
  return res.data;
};

export const searchProducts = async ({ page = 0, size = 8, q = '', priceRange = 'all', brands = [], discountOnly = false } = {}) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('size', size);
  if (q) params.append('q', q);
  if (priceRange !== 'all') params.append('priceRange', priceRange);
  if (brands.length) params.append('brands', brands.join(',')); // multiple brands
  if (discountOnly) params.append('discountOnly', true);

  const res = await api.get(`/products/search?${params.toString()}`);
  console.log(res.data)
  return res.data;
};

export const searchProductsByName = async ({ name = '', limit = 10 } = {}) => {
  if (!name) return [];

  const params = new URLSearchParams();
  params.append('name', name);
  params.append('limit', limit);

  const res = await api.get(`/products/search/name?${params.toString()}`);
  console.log(res.data);
  return res.data;
};
