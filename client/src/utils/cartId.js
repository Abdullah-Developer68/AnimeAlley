export function getOrCreateCartId() {
  // For authenticated users, we don't need localStorage cartId
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (userInfo) {
    return `user_${userInfo.id}`; // Generate consistent cartId from user ID
  }

  // Fallback for unauthenticated users (backward compatibility)
  let cartId = localStorage.getItem("cartId");
  if (!cartId) {
    cartId = crypto.randomUUID();
    localStorage.setItem("cartId", cartId);
  }
  return cartId;
}
