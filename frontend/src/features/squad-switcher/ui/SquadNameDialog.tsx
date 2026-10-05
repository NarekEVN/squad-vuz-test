import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { type FormEvent, useEffect, useState } from 'react'
import { SQUAD_NAME_MAX_LENGTH } from '../model/squad-switcher.constants'

interface SquadNameDialogProps {
  open: boolean
  title: string
  submitLabel: string
  initialName: string
  error: string | null
  busy: boolean
  onSubmit: (name: string) => void
  onClose: () => void
}

export function SquadNameDialog({
  open,
  title,
  submitLabel,
  initialName,
  error,
  busy,
  onSubmit,
  onClose,
}: SquadNameDialogProps) {
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (open) {
      setName(initialName)
    }
  }, [open, initialName])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(name.trim())
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={submit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Squad name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            inputProps={{ maxLength: SQUAD_NAME_MAX_LENGTH }}
            autoFocus
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={busy || name.trim() === ''}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
