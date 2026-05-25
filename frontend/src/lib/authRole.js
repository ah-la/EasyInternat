export const roles = {
  admin: {
    label: 'Admin',
    subtitle: 'Acces complet',
    gender: null
  },
  responsable_filles: {
    label: 'Responsable des filles',
    subtitle: 'Internat filles',
    gender: 'Fille'
  },
  responsable_garcons: {
    label: 'Responsable des garcons',
    subtitle: 'Internat garcons',
    gender: 'Garcon'
  },
  stagiaire: {
    label: 'Stagiaire',
    subtitle: 'Espace stagiaire',
    gender: null
  }
}

export function normalizeRole(user = {}) {
  if (user.role === 'admin') return 'admin'
  if (user.role === 'stagiaire') return 'stagiaire'
  if (user.role === 'responsable' && user.category === 'filles') return 'responsable_filles'
  if (user.role === 'responsable' && user.category === 'garcons') return 'responsable_garcons'
  return user.role || null
}

export function isAuthenticated() {
  return sessionStorage.getItem('easyinternat-auth') === '1'
}

export function getHomePath(role = getCurrentRole()) {
  if (role === 'admin') return '/admin'
  if (role === 'responsable_filles' || role === 'responsable_garcons') return '/responsable'
  if (role === 'stagiaire') return '/stagiaire/presence'
  return '/'
}

export function getCurrentRole() {
  return sessionStorage.getItem('easyinternat-role')
}

export function setCurrentRole(role) {
  sessionStorage.setItem('easyinternat-role', role)
}

export function setAuthSession(role, user = {}) {
  sessionStorage.setItem('easyinternat-auth', '1')
  sessionStorage.setItem('easyinternat-role', role)
  sessionStorage.setItem('easyinternat-user', JSON.stringify(user))
}

export function clearCurrentRole() {
  sessionStorage.removeItem('easyinternat-auth')
  sessionStorage.removeItem('easyinternat-role')
  sessionStorage.removeItem('easyinternat-user')
  sessionStorage.removeItem('token')
}

export function getRoleInfo(role = getCurrentRole()) {
  return roles[role] || roles.stagiaire
}

export function filterStagiairesByRole(rows, role = getCurrentRole()) {
  const { gender } = getRoleInfo(role)
  return gender ? rows.filter((row) => String(row.genre || '').toLowerCase().includes(gender.toLowerCase().slice(0, 3))) : rows
}
