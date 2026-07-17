export async function uploadFile(file: File | Blob, filename?: string): Promise<string> {
  const form = new FormData();
  form.append("file", file, filename ?? (file instanceof File ? file.name : "voice-note.webm"));
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Upload failed");
  }
  const data = await res.json();
  return data.url as string;
}
