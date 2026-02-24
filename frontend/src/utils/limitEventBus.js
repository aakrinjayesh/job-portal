let listeners = [];

export const subscribeToLimit = (callback) => {
  listeners.push(callback);
};

export const unsubscribeFromLimit = (callback) => {
  listeners = listeners.filter((l) => l !== callback);
};

export const triggerLimitModal = (data) => {
  listeners.forEach((callback) => callback(data));
};
