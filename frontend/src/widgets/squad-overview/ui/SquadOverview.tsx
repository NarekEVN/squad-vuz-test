import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { type Squad } from '../../../entities/squad/model/squad.types'
import { SquadStats } from '../../../entities/squad/ui/SquadStats'
import { useSquadMemberToggle } from '../../../features/toggle-squad-member/model/use-squad-member-toggle'
import {
  EMPTY_SQUAD_TITLE,
  FULL_SQUAD_TITLE,
  MEMBER_AVATAR_SIZE,
} from '../model/squad-overview.constants'
import { MemberAvatar } from './MemberAvatar'

interface SquadOverviewProps {
  squad: Squad | undefined
  isLoading: boolean
}

export function SquadOverview({ squad, isLoading }: SquadOverviewProps) {
  const { remove } = useSquadMemberToggle(squad?.id ?? null)
  const members = squad?.members ?? []

  return (
    <Box
      component="section"
      aria-label="Your squad"
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
    >
      <Typography component="h1" sx={{ fontSize: 20, fontWeight: 500 }}>
        {members.length > 0 ? FULL_SQUAD_TITLE : EMPTY_SQUAD_TITLE}
      </Typography>
      {isLoading && (
        <Skeleton variant="circular" width={MEMBER_AVATAR_SIZE} height={MEMBER_AVATAR_SIZE} />
      )}
      {!isLoading && members.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {members.map((member) => (
            <MemberAvatar
              key={member.character.id}
              character={member.character}
              onRemove={() => remove(member.character)}
            />
          ))}
        </Box>
      )}
      <SquadStats stats={squad?.stats} />
    </Box>
  )
}
