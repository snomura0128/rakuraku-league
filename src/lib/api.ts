/**
 * API client for Worker endpoints
 */

const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"
}

export const apiClient = {
  async post(endpoint: string, data: any) {
    const baseUrl = getApiBaseUrl()
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response
  },

  async get(endpoint: string) {
    const baseUrl = getApiBaseUrl()
    const response = await fetch(`${baseUrl}${endpoint}`)
    return response
  },

  async patch(endpoint: string, data: any) {
    const baseUrl = getApiBaseUrl()
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response
  },
}

export default apiClient
