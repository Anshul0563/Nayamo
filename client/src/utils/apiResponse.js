const isApiPayload = (payload) =>
  payload && typeof payload === "object" && !Array.isArray(payload);

export const getProductsFromResponse = (payload) => {
  if (!isApiPayload(payload)) return null;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.products)) return payload.data.products;
  if (Array.isArray(payload.products)) return payload.products;
  return null;
};

export const getPaginationFromResponse = (payload) => {
  if (!isApiPayload(payload)) return null;
  return (
    payload.pagination ||
    payload.data?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 0,
    }
  );
};
