let loadingCount = 0;
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((callback) => callback(loadingCount));
};

export const subscribeLoading = (callback) => {
  listeners.add(callback);
  callback(loadingCount);
  return () => listeners.delete(callback);
};

export const incrementLoading = () => {
  loadingCount += 1;
  notifyListeners();
};

export const decrementLoading = () => {
  loadingCount = Math.max(0, loadingCount - 1);
  notifyListeners();
};

export const getLoadingCount = () => loadingCount;
