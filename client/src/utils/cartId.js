export function getOrCreateCartId() {
  let cartId = localStorage.getItem("cartId");
  if (!cartId) {
    cartId = crypto.randomUUID(); // or use a uuid library if you want
    localStorage.setItem("cartId", cartId);
  }
  return cartId;
}
