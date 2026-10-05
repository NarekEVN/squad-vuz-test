import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useActiveSquad } from '../../../entities/squad/model/use-active-squad'
import { CharacterFiltersPanel } from '../../../widgets/character-filters-panel/ui/CharacterFiltersPanel'
import { CharactersTable } from '../../../widgets/characters-table/ui/CharactersTable'
import { Header } from '../../../widgets/header/ui/Header'
import { SquadOverview } from '../../../widgets/squad-overview/ui/SquadOverview'

export function SquadBuilderPage() {
  const { squad, isLoading, isError, refetch } = useActiveSquad()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Box component="main" sx={{ maxWidth: 840, mx: 'auto', px: 2, pb: 6 }}>
        <Stack spacing={4}>
          {isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={refetch}>
                  Retry
                </Button>
              }
            >
              Couldn't load your squad.
            </Alert>
          )}
          <SquadOverview squad={squad} isLoading={isLoading && !isError} />
          <CharacterFiltersPanel />
          <CharactersTable squad={squad} />
        </Stack>
      </Box>
    </Box>
  )
}
