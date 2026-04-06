import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import { Spinner } from './ui/Spinner'

export default function AuthLayout({ children, authentication = true }) {
  const navigate = useNavigate()
  const [loader, setLoader] = useState(true)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    // True: authenticated? No (false) -> /login
    // False: authenticated? Yes (true) -> /dashboard
    
    if (authentication && isAuthenticated !== authentication) {
      navigate('/login')
    } else if (!authentication && isAuthenticated !== authentication) {
      navigate('/dashboard')
    }
    setLoader(false)
  }, [isAuthenticated, navigate, authentication])

  return loader ? <div className="flex justify-center p-12"><Spinner /></div> : <>{children}</>
}
