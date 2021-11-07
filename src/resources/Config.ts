const API_PROTOCOL = process.env.NEXT_PUBLIC_API_PROTOCOL
const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN
const API_PATH = process.env.NEXT_PUBLIC_API_PATH
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION
const API_BASE_URL = `${API_PROTOCOL}://${API_DOMAIN}/${API_PATH}/${API_VERSION}`

export const Config = {
  API_BASE_URL,
  QUERY_LIMIT_DEFAULT: 20
}
