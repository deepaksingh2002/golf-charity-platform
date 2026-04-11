import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectIsAdmin, selectIsAuthenticated } from '../store/slices/authSlice'
import { Spinner } from './ui/Spinner'

export default function AuthLayout({ children, authentication = true }) {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  const shouldRedirect = authentication ? isAuthenticated === false : isAuthenticated === true;

  useEffect(() => {
    if (!shouldRedirect) {
      return
    }
    navigate(authentication ? '/login' : (isAdmin ? '/admin' : '/dashboard'))
  }, [authentication, isAdmin, navigate, shouldRedirect])

  return shouldRedirect
    ? <div className="flex justify-center p-12"><Spinner /></div>
    : <>{children}</>
}
