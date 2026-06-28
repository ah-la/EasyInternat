import api from '../services/api.js'
import { getHomePath, normalizeRole, setAuthSession } from './authRole.js'

export async function loginUser({ email, password, expectedRole }) {
  const cleanEmail = email.trim().toLowerCase()

  const { data } = await api.post('/login', { email: cleanEmail, password }).catch((error) => {
    if (!error.response) {
      throw new Error('Impossible de contacter le serveur Laravel. Lancez le backend sur http://127.0.0.1:8000 puis reessayez.')
    }

    if (error.response.status === 404) {
      throw new Error("API introuvable. Verifiez que Laravel tourne sur http://127.0.0.1:8000 et que la route /api/login existe.")
    }

    if (error.response.status >= 500) {
      throw new Error("Le backend Laravel ne repond pas correctement. Redemarrez le serveur avec npm run dev pour lancer Laravel et Vite ensemble.")
    }

    throw new Error(error.response?.data?.message || 'Identifiants incorrects')
  })

  const role = normalizeRole(data.user)

  if (expectedRole && role !== expectedRole) {
    throw new Error("Ce compte n'a pas le role demande.")
  }

  sessionStorage.setItem('token', data.token)
  setAuthSession(role, data.user)
  return { role, user: data.user }
}

export function destinationForRole(role) {
  return getHomePath(role)
}
