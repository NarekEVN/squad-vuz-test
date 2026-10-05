import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  selectIsAuthenticated,
  selectSessionUser,
} from '../../../entities/session/model/session.slice'
import { LogoutButton } from '../../../features/auth/ui/LogoutButton'
import { SquadSwitcher } from '../../../features/squad-switcher/ui/SquadSwitcher'
import logo from '../../../shared/assets/mortal-kombat-logo.png'
import { useAppSelector } from '../../../shared/lib/store-hooks'
import { HEADER_HEIGHT, LOGO_OVERHANG, LOGO_SIZE, LOGO_TOP } from '../model/header.constants'

export function Header() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectSessionUser)

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        height: HEADER_HEIGHT,
        bgcolor: 'common.black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: 2,
        mb: `${LOGO_OVERHANG + 16}px`,
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="Mortal Kombat"
        sx={{
          position: 'absolute',
          left: '50%',
          top: LOGO_TOP,
          transform: 'translateX(-50%)',
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          objectFit: 'cover',
          borderRadius: '50%',
        }}
      />
      {isAuthenticated && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SquadSwitcher />
          <Typography
            sx={{ color: 'grey.400', fontSize: 12, display: { xs: 'none', md: 'block' } }}
          >
            {user?.email}
          </Typography>
          <LogoutButton />
        </Box>
      )}
    </Box>
  )
}
