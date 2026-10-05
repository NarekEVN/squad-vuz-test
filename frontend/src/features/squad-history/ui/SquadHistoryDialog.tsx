import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { skipToken } from '@reduxjs/toolkit/query'
import { useGetSquadHistoryQuery } from '../../../entities/squad/api/squads.api'
import { CharacterAvatar } from '../../../entities/character/ui/CharacterAvatar'
import { describeActivity, formatActivityTime } from '../lib/describe-activity'

interface SquadHistoryDialogProps {
  squadId: string | null
  squadName: string | undefined
  open: boolean
  onClose: () => void
}

export function SquadHistoryDialog({ squadId, squadName, open, onClose }: SquadHistoryDialogProps) {
  const { data, isLoading, isError, refetch } = useGetSquadHistoryQuery(
    open && squadId ? squadId : skipToken,
  )

  const renderContent = () => {
    if (isLoading) {
      return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 3 }} />
    }
    if (isError) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          Couldn't load the history.
        </Alert>
      )
    }
    if (!data || data.items.length === 0) {
      return (
        <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
          Nothing has happened in this squad yet.
        </Typography>
      )
    }
    return (
      <List dense disablePadding>
        {data.items.map((event) => (
          <ListItem key={event.id} disableGutters>
            <ListItemAvatar>
              {event.character ? (
                <CharacterAvatar character={event.character} size={32} />
              ) : (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                  {event.squadName.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </ListItemAvatar>
            <ListItemText
              primary={describeActivity(event)}
              secondary={formatActivityTime(event.occurredAt)}
            />
          </ListItem>
        ))}
      </List>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{squadName ? `${squadName} history` : 'Squad history'}</DialogTitle>
      <DialogContent dividers>{renderContent()}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
