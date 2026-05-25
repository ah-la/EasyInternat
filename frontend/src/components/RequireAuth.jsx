import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentRole, getHomePath, isAuthenticated } from '../lib/authRole.js'

export default function RequireAuth({ allowedRoles }) {
  const location = useLocation()
  const role = getCurrentRole()

  if (!isAuthenticated() || !role) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to={getHomePath(role)} replace />
  }

  return <Outlet />
}
