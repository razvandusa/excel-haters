export default function debugApiRequest({ method = 'GET', url, payload }) {
  if (payload === undefined) {
    console.debug(`[API] ${method} ${url}`)
    return
  }

  console.debug(`[API] ${method} ${url}`, payload)
}
