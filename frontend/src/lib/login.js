import api from '../services/api.js'
import { getHomePath, normalizeRole, setAuthSession } from './authRole.js'

export async function loginUser({ email, password, expectedRole }) {
  const cleanEmail = email.trim().toLowerCase()

  try {
    const { data } = await api.post('/login', { email: cleanEmail, password })
    const role = normalizeRole(data.user)

    if (expectedRole && role !== expectedRole) {
      throw new Error('role_mismatch')
    }

    sessionStorage.setItem('token', data.token)
    setAuthSession(role, data.user)
    return { role, user: data.user }
  } catch (error) {
    throw new Error('Identifiants incorrects')
  }
}

export function destinationForRole(role) {
  return getHomePath(role)
}
