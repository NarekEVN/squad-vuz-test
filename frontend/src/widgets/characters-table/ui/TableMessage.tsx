import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

interface TableMessageProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function TableMessage({ title, description, actionLabel, onAction }: TableMessageProps) {
  return (
    <Box sx={{ py: 6, px: 2, textAlign: 'center' }} role="status">
      <Typography sx={{ fontWeight: 500 }}>{title}</Typography>
      {description && (
        <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.5 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} sx={{ mt: 2 }} variant="outlined">
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
