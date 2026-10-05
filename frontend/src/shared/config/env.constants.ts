export const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3000/api/v1'

export const REALTIME_URL = process.env.REACT_APP_REALTIME_URL ?? new URL(API_URL).origin
