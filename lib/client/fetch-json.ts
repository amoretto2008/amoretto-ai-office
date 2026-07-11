export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "処理に失敗しました。");
  return data as T;
}
