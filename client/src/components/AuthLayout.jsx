import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useGetMeQuery } from '../store/api/authApiSlice'
import {
  hasAdminAccess,
  selectIsAuthenticated,
  selectToken,
  selectUser,
} from '../store/slices/authSlice'
import { Spinner } from './ui/Spinner'

export default function AuthLayout({ children, authentication = true }) {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const token = useSelector(selectToken)
  const storedUser = useSelector(selectUser)
  const { data: hydratedUser, isFetching: isHydratingUser } = useGetMeQuery(undefined, {
    skip: !token,
  })
  const effectiveUser = hydratedUser || storedUser
  const isAdmin = hasAdminAccess(effectiveUser)
  const shouldRedirect = authentication ? isAuthenticated === false : isAuthenticated === true;
  const waitingForRoleResolution = !authentication && isAuthenticated && !!token && (!effectiveUser || isHydratingUser)

  useEffect(() => {
    if (!shouldRedirect || waitingForRoleResolution) {
      return
    }
    navigate(authentication ? '/login' : (isAdmin ? '/admin' : '/dashboard'))
  }, [authentication, isAdmin, navigate, shouldRedirect, waitingForRoleResolution])

  return (shouldRedirect || waitingForRoleResolution)
    ? <div className="flex justify-center p-12"><Spinner /></div>
    : <>{children}</>
}
