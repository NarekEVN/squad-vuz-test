import MoreVertIcon from '@mui/icons-material/MoreVert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useState } from 'react'
import {
  useCreateSquadMutation,
  useDeleteSquadMutation,
  useUpdateSquadMutation,
} from '../../../entities/squad/api/squads.api'
import { activeSquadSelected } from '../../../entities/squad/model/active-squad.slice'
import { useActiveSquad } from '../../../entities/squad/model/use-active-squad'
import { apiErrorMessage } from '../../../shared/lib/api-error'
import { useAppDispatch } from '../../../shared/lib/store-hooks'
import { notified } from '../../../shared/model/notifications.slice'
import { SquadHistoryDialog } from '../../squad-history/ui/SquadHistoryDialog'
import { type SquadDialogMode } from '../model/squad-switcher.types'
import { SquadNameDialog } from './SquadNameDialog'

export function SquadSwitcher() {
  const dispatch = useAppDispatch()
  const { squads, squadId, squad } = useActiveSquad()
  const [createSquad, createState] = useCreateSquadMutation()
  const [updateSquad, updateState] = useUpdateSquadMutation()
  const [deleteSquad] = useDeleteSquadMutation()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [dialog, setDialog] = useState<SquadDialogMode>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const openDialog = (mode: SquadDialogMode) => {
    setMenuAnchor(null)
    setDialogError(null)
    setDialog(mode)
  }

  const submitName = async (name: string) => {
    try {
      if (dialog === 'create') {
        const created = await createSquad({ name }).unwrap()
        dispatch(activeSquadSelected(created.id))
      } else if (squadId) {
        await updateSquad({ squadId, name }).unwrap()
      }
      setDialog(null)
    } catch (error) {
      setDialogError(apiErrorMessage(error))
    }
  }

  const removeSquad = async () => {
    setMenuAnchor(null)
    if (!squadId || !window.confirm(`Delete "${squad?.name ?? 'this squad'}"?`)) {
      return
    }
    try {
      await deleteSquad(squadId).unwrap()
      dispatch(activeSquadSelected(null))
    } catch (error) {
      dispatch(notified(apiErrorMessage(error)))
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Select
        value={squadId ?? ''}
        onChange={(event) => dispatch(activeSquadSelected(event.target.value))}
        size="small"
        variant="standard"
        disableUnderline
        inputProps={{ 'aria-label': 'Active squad' }}
        sx={{
          color: 'common.white',
          fontSize: 14,
          maxWidth: 180,
          '& .MuiSvgIcon-root': { color: 'common.white' },
        }}
      >
        {squads.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.name} ({option.memberCount})
          </MenuItem>
        ))}
      </Select>
      <IconButton
        aria-label="Squad options"
        onClick={(event) => setMenuAnchor(event.currentTarget)}
        size="small"
        sx={{ color: 'common.white' }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => openDialog('create')}>New squad</MenuItem>
        <MenuItem onClick={() => openDialog('rename')} disabled={!squadId}>
          Rename squad
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null)
            setHistoryOpen(true)
          }}
          disabled={!squadId}
        >
          Squad history
        </MenuItem>
        <MenuItem onClick={removeSquad} disabled={!squadId} sx={{ color: 'error.main' }}>
          Delete squad
        </MenuItem>
      </Menu>
      <SquadHistoryDialog
        squadId={squadId}
        squadName={squad?.name}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
      <SquadNameDialog
        open={dialog !== null}
        title={dialog === 'create' ? 'New squad' : 'Rename squad'}
        submitLabel={dialog === 'create' ? 'Create' : 'Save'}
        initialName={dialog === 'rename' ? (squad?.name ?? '') : ''}
        error={dialogError}
        busy={createState.isLoading || updateState.isLoading}
        onSubmit={submitName}
        onClose={() => setDialog(null)}
      />
    </Box>
  )
}
