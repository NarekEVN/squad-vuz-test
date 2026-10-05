import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { useAppDispatch, useAppSelector } from '../lib/store-hooks'
import { notificationDismissed, selectNotification } from '../model/notifications.slice'

const AUTO_HIDE_MS = 4000

export function NotificationSnackbar() {
  const dispatch = useAppDispatch()
  const notification = useAppSelector(selectNotification)
  const close = () => dispatch(notificationDismissed())

  return (
    <Snackbar
      key={notification?.id}
      open={notification !== null}
      autoHideDuration={AUTO_HIDE_MS}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {notification ? (
        <Alert onClose={close} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  )
}
