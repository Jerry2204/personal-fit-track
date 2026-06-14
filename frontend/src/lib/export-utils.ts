const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth-token")
}

export async function downloadCsv(path: string, filename: string) {
  const token = getToken()
  if (!token) {
    console.error("No auth token found")
    return
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Download failed" }))
      throw new Error(body.message || `HTTP ${res.status}`)
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error("CSV download failed:", err)
    throw err
  }
}
