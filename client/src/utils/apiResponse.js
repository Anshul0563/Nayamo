export const getProductsFromResponse = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (Array.isArray(payload?.products)) return payload.products;
  return [];
};

export const getPaginationFromResponse = (payload) =>
  payload?.pagination ||
  payload?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 0,
  };
