export function getCookie(name: string): string | undefined {
  const cookies = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("="));
  const match = cookies.find((cookie) => cookie[0] === name);
  return match ? match[1] : undefined;
}
