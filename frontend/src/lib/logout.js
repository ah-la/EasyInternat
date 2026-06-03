import api from '../services/api.js'
import { clearCurrentRole } from './authRole.js'

export async function logoutUser() {
  try {
    await api.post('/logout')
  } catch {
    // Local session cleanup should still happen if the token already expired.
  } finally {
    clearCurrentRole()
  }
}
