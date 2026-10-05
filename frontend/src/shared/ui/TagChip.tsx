import CheckIcon from '@mui/icons-material/Check'
import Chip from '@mui/material/Chip'
import { capitalize } from '../lib/format'

interface TagChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
}

export function TagChip({ label, selected = false, onClick }: TagChipProps) {
  return (
    <Chip
      label={capitalize(label)}
      color="primary"
      size="small"
      variant={selected ? 'filled' : 'outlined'}
      icon={selected ? <CheckIcon /> : undefined}
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
    />
  )
}
