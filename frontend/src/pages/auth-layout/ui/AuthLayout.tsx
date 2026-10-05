import Box from '@mui/material/Box'
import { type ReactNode } from 'react'
import { Header } from '../../../widgets/header/ui/Header'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Box component="main" sx={{ display: 'flex', justifyContent: 'center', px: 2, pb: 6 }}>
        {children}
      </Box>
    </Box>
  )
}
