import api from '../services/api.js'
import { getHomePath, normalizeRole, setAuthSession } from './authRole.js'

export async function loginUser({ email, password, expectedRole }) {
  const cleanEmail = email.trim().toLowerCase()

  const { data } = await api.post('/login', { email: cleanEmail, password }).catch((error) => {
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
