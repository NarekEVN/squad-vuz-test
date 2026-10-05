import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { Provider } from 'react-redux'
import { theme } from '../shared/theme/theme'
import { NotificationSnackbar } from '../shared/ui/NotificationSnackbar'
import { AppRouter } from './router/AppRouter'
import { store } from './store'

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouter />
        <NotificationSnackbar />
      </ThemeProvider>
    </Provider>
  )
}
