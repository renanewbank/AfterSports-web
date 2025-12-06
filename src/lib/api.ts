import axios from 'axios'

// chave para gravar o token no localStorage
export const TOKEN_KEY = 'aftersports:token'

const api = axios.create({
  baseURL: '', // usamos o proxy do Vite (/api -> 8080)
})

// injeta Authorization quando houver token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error', error)
    const message =
      error.response?.data?.message ||
      error.message ||
      'Erro ao comunicar com o servidor.'
    return Promise.reject(new Error(message))
  },
)

export const get = async <T>(url: string, params?: Record<string, unknown>) => {
  const { data } = await api.get<T>(url, { params })
  return data
}

export const post = async <T, B>(url: string, body: B) => {
  const { data } = await api.post<T>(url, body)
  return data
}

export const put = async <T, B>(url: string, body: B) => {
  const { data } = await api.put<T>(url, body)
  return data
}

export const del = async <T>(url: string) => {
  const { data } = await api.delete<T>(url)
  return data
}

export default api
