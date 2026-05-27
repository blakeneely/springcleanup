export type Participant = {
  /** Stable identifier - drives the avatar hash color and join/leave logic. */
  id: string
  /** Display name shown on the chip and read aloud by screen readers. */
  name: string
  /**
   * How many capacity units this participant occupies. Defaults to 1.
   * Useful for "Mary brings 2 cases of water" style sign-ups.
   */
  quantity?: number
  /**
   * Optional avatar image URL. Falls back to initials over a hashed
   * background color when missing or when the image fails to load.
   */
  avatarUrl?: string
}

export type CurrentUser = {
  /** Stable identifier - matched against `Participant.id` to detect membership. */
  id: string
  /** Display name; used for the live announcer and chip label. */
  name: string
  /** Optional avatar image URL. */
  avatarUrl?: string
}
