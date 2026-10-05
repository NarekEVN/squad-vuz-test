import { createTheme } from '@mui/material/styles'
import { COLORS } from './colors.constants'

export const theme = createTheme({
  palette: {
    primary: { main: COLORS.primary, contrastText: COLORS.white },
    error: { main: COLORS.red },
    text: { primary: COLORS.black, secondary: COLORS.gray },
    background: { default: COLORS.background, paper: COLORS.white },
    divider: COLORS.divider,
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  shape: { borderRadius: 4 },
  components: {
    MuiChip: {
      styleOverrides: {
        root: { fontSize: 12, height: 24 },
        outlined: { backgroundColor: COLORS.white },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none' } },
    },
  },
})
