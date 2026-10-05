import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { Fragment } from 'react'
import { formatAverage } from '../../../shared/lib/format'
import { STAT_GROUPS } from '../model/squad.constants'
import { type SquadStats as SquadStatsModel } from '../model/squad.types'

interface SquadStatsProps {
  stats: SquadStatsModel | undefined
}

export function SquadStats({ stats }: SquadStatsProps) {
  const averageOf = (name: string) =>
    formatAverage(stats?.abilities.find((ability) => ability.name === name)?.average ?? null)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'stretch' }} role="list" aria-label="Squad averages">
        {STAT_GROUPS.map((group, index) => (
          <Fragment key={group.join('-')}>
            {index > 0 && <Divider orientation="vertical" flexItem />}
            {group.map((name) => (
              <Box key={name} role="listitem" sx={{ px: 1.5, textAlign: 'center', minWidth: 64 }}>
                <Typography sx={{ fontSize: 12 }}>{name}</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, mt: 1.5 }}>
                  {averageOf(name)}
                </Typography>
              </Box>
            ))}
          </Fragment>
        ))}
      </Box>
      <Typography sx={{ fontSize: 9, color: 'text.secondary' }}>
        * Totals as average for squad
      </Typography>
    </Box>
  )
}
