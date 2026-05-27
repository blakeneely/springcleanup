import type { Messages } from '../types'

export const defaultMessages: Messages = {
  timeZoneNote: 'All times in {timeZone}',
  slotFull: 'Full',
  slotsRemainingOne: '{count} spot remaining',
  slotsRemainingOther: '{count} spots remaining',
  slotsFilledOfTotal: '{filled} of {total} spots filled',
  signUp: 'Sign up',
  signUpFull: 'Sign up (full)',
  leave: 'Leave',
  signingUp: 'Signing up...',
  leaving: 'Leaving...',
  joinError: "Couldn't sign up — try again",
  leaveError: "Couldn't leave — try again",
  signedUpAnnouncement: 'Signed up for {slotLabel}. {remaining}',
  leftAnnouncement: 'Left {slotLabel}.',
  showMoreParticipants: 'Show {count} more participants',
  showFewerParticipants: 'Show fewer participants',
  emptySheet: 'This sign-up sheet has no slots yet.',
  emptyGroup: 'No slots in this group.',
  emptyDateGroup: 'No slots on this date.',
  loadingSheet: 'Loading sign-up sheet...',
  you: 'You'
}
