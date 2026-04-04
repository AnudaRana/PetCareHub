export function getLoggedInUserId() {
  return Number(localStorage.getItem("userId") || 1);
}
