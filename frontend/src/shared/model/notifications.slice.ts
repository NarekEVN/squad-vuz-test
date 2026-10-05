import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type NotificationSeverity, type NotificationsState } from './notifications.types'

const initialState: NotificationsState = { current: null }

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notified: {
      reducer(state, action: PayloadAction<{ message: string; severity: NotificationSeverity }>) {
        state.current = { id: Date.now(), ...action.payload }
      },
      prepare(message: string, severity: NotificationSeverity = 'error') {
        return { payload: { message, severity } }
      },
    },
    notificationDismissed(state) {
      state.current = null
    },
  },
  selectors: {
    selectNotification: (state) => state.current,
  },
})

export const { notified, notificationDismissed } = notificationsSlice.actions
export const { selectNotification } = notificationsSlice.selectors
