export function getApiErrorMessage(error, fallback = "Something went wrong") {
  if (error?.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  if (!error?.response) {
    return "We could not reach the server. Please check your connection and try again.";
  }

  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    fallback
  );
}
