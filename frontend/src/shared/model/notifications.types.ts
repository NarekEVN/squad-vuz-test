export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error'

export interface Notification {
  id: number
  message: string
  severity: NotificationSeverity
}

export interface NotificationsState {
  current: Notification | null
}
