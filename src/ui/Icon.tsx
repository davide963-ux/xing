import type { ReactNode } from 'react'

/**
 * Custom icon set (no emoji). Everything is drawn on a 32x32 grid and inherits `currentColor`;
 * `--cut` is the colour of cut-outs (dark by default). <IconDefs/> must be rendered once so the
 * gradients used by badges are available.
 */

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const cut = 'var(--cut, #2b1d00)'

const SHAPES: Record<string, ReactNode> = {
  trophy: (
    <>
      <path d="M9 4h14v7a7 7 0 0 1-14 0V4z" />
      <path d="M9 6H4.5v3a5 5 0 0 0 5 5M23 6h4.5v3a5 5 0 0 1-5 5" {...stroke} />
      <path d="M14 18h4v5h-4z" />
      <path d="M10 29a2.5 2.5 0 0 1 2.5-2.5h7A2.5 2.5 0 0 1 22 29z" />
    </>
  ),
  user: (
    <>
      <circle cx="16" cy="10.5" r="6" />
      <path d="M4.5 29c0-6.5 5-10.5 11.5-10.5S27.5 22.500 27.500 29z" />
    </>
  ),
  users: (
    <>
      <circle cx="11" cy="11" r="5" />
      <path d="M1.500 28c0-5.500 4.200-9 9.500-9s9.500 3.500 9.500 9z" />
      <circle cx="22.500" cy="12" r="4.200" />
      <path d="M20 19.500c1-.4 2-.5 3-.5 4.800 0 7.500 3 7.500 9H22.500c0-3.500-.9-6.500-2.500-8.500z" opacity=".8" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="6" width="24" height="22" rx="4.500" {...stroke} />
      <path d="M4 13.500h24M10.500 3v6M21.500 3v6" {...stroke} />
      <circle cx="11" cy="19.500" r="1.900" />
      <circle cx="16" cy="19.500" r="1.900" />
      <circle cx="21" cy="19.500" r="1.900" />
      <circle cx="11" cy="24.500" r="1.900" />
      <circle cx="16" cy="24.500" r="1.900" />
    </>
  ),
  soundOn: (
    <>
      <path d="M4 12h5.500L17 5.500v21L9.500 20H4z" />
      <path d="M21.500 11a7.500 7.500 0 0 1 0 10M25 7a12.500 12.500 0 0 1 0 18" {...stroke} />
    </>
  ),
  soundOff: (
    <>
      <path d="M4 12h5.500L17 5.500v21L9.500 20H4z" />
      <path d="M22 12l7 8M29 12l-7 8" {...stroke} />
    </>
  ),
  star: <path d="M16 2.500l4 8.500 9.300 1.200-6.800 6.400 1.800 9.200L16 23.200 7.700 27.800l1.800-9.200-6.800-6.400L12 11z" />,
  flame: <path d="M16.500 2c.8 5.500 7.500 8.500 7.500 16a8 8 0 0 1-16 0c0-3.200 1.600-5.500 3.300-7.200.3 2.200 1.300 3.400 2.500 4C13 10.500 14.800 6 16.500 2z" />,
  crown: (
    <>
      <path d="M3 25L1.500 9.500l7.500 6.500L16 4.500 23 16l7.500-6.500L29 25z" />
      <rect x="3" y="26.500" width="26" height="3" rx="1.500" />
    </>
  ),
  globe: (
    <>
      <circle cx="16" cy="16" r="12.500" {...stroke} />
      <ellipse cx="16" cy="16" rx="5.500" ry="12.500" {...stroke} />
      <path d="M3.500 16h25M6 9h20M6 23h20" {...stroke} />
    </>
  ),
  bolt: <path d="M18.500 1.500L6 18h8.500L12.500 30.500 26 13h-8.500z" />,
  shield: (
    <>
      <path d="M16 2.500l11 4.200v8.800c0 7-4.600 11.500-11 14.500C9.600 27 5 22.500 5 15.500V6.700z" />
      <path d="M10.500 16l4 4 7.500-8" fill="none" stroke={cut} strokeWidth="2.800" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  lock: (
    <>
      <rect x="6.500" y="14" width="19" height="14.500" rx="3.500" />
      <path d="M10.500 14v-3.500a5.500 5.500 0 0 1 11 0V14" {...stroke} strokeWidth="2.800" />
      <circle cx="16" cy="21" r="2" fill={cut} />
    </>
  ),
  cards: (
    <>
      <g transform="rotate(-14 11 19)">
        <rect x="3" y="6" width="15" height="21" rx="3" opacity=".55" />
      </g>
      <g transform="rotate(9 21 17)">
        <rect x="12.500" y="5" width="16" height="22" rx="3" />
        <path d="M20.500 11c-3 3.500-5 4.800-5 7.200a2.700 2.700 0 0 0 4.500 2c0 1.500-.5 2.500-1.500 3.300h4c-1-.8-1.500-1.800-1.500-3.300a2.700 2.700 0 0 0 4.500-2c0-2.400-2-3.700-5-7.200z" fill={cut} transform="translate(0 -.5) scale(.9) translate(2.200 1.500)" />
      </g>
    </>
  ),
  jack: (
    <>
      <rect x="6.500" y="3" width="19" height="26" rx="3.500" />
      <text x="16" y="22.500" textAnchor="middle" fontSize="19" fontWeight="900" fontFamily="Georgia, serif" fill={cut}>
        J
      </text>
    </>
  ),
  phone: (
    <>
      <rect x="8.500" y="2.500" width="15" height="27" rx="4" />
      <rect x="11" y="7" width="10" height="16" rx="1.500" fill={cut} />
      <circle cx="16" cy="26" r="1.200" fill={cut} />
    </>
  ),
  bot: (
    <>
      <rect x="5.500" y="11" width="21" height="16" rx="5.500" />
      <circle cx="12" cy="19" r="2.400" fill={cut} />
      <circle cx="20" cy="19" r="2.400" fill={cut} />
      <path d="M16 11V6.500" {...stroke} />
      <circle cx="16" cy="4.800" r="2.200" />
      <path d="M2.500 17.500v3M29.500 17.500v3" {...stroke} />
    </>
  ),
  spark: <path d="M16 1.500l3.600 11L30.500 16l-10.900 3.500L16 30.500l-3.600-11L1.500 16l10.900-3.500z" />,
  spade: <path d="M16 2.500C11 9.500 4.500 13 4.500 19a5.700 5.700 0 0 0 9.500 4.200c0 3-1 5-3 6.300h10c-2-1.300-3-3.300-3-6.300a5.700 5.700 0 0 0 9.500-4.200C27.500 13 21 9.500 16 2.500z" />,
  heart: <path d="M16 29C6 21 3.500 15.500 3.500 11.200a6.300 6.300 0 0 1 12.500-1.200 6.300 6.300 0 0 1 12.500 1.200C28.500 15.500 26 21 16 29z" />,
  diamond: <path d="M16 2l11 14-11 14L5 16z" />,
  club: (
    <>
      <circle cx="16" cy="10" r="6" />
      <circle cx="9" cy="19" r="6" />
      <circle cx="23" cy="19" r="6" />
      <path d="M16 17c0 6-1 9-3.500 11.500h7C17 26 16 23 16 17z" />
    </>
  ),
}

export type IconName = keyof typeof SHAPES

export function Icon({ name, size = 24, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="currentColor"
      className={`icon-svg ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {SHAPES[name]}
    </svg>
  )
}

/** Logo ornament: the four suits, hearts and diamonds in red. */
export function SuitRow({ size = 20 }: { size?: number }) {
  return (
    <span className="suitrow" aria-hidden="true">
      <Icon name="spade" size={size} />
      <Icon name="heart" size={size} className="red" />
      <Icon name="diamond" size={size} className="red" />
      <Icon name="club" size={size} />
    </span>
  )
}

// ------------------------------------------------------------ achievement badges

type Tier = 'bronze' | 'silver' | 'gold' | 'special'
const ACH: Record<string, { tier: Tier; glyph: IconName | string }> = {
  first_win: { tier: 'bronze', glyph: 'trophy' },
  wins_10: { tier: 'silver', glyph: 'trophy' },
  wins_50: { tier: 'gold', glyph: 'trophy' },
  first_xing: { tier: 'bronze', glyph: 'bolt' },
  xings_10: { tier: 'silver', glyph: 'flame' },
  xings_25: { tier: 'gold', glyph: 'flame' },
  jack_xing: { tier: 'special', glyph: 'jack' },
  win_no_xing: { tier: 'silver', glyph: 'shield' },
  streak_3: { tier: 'bronze', glyph: '3' },
  streak_5: { tier: 'silver', glyph: '5' },
  games_10: { tier: 'bronze', glyph: 'cards' },
  games_50: { tier: 'silver', glyph: 'cards' },
  online_first: { tier: 'bronze', glyph: 'globe' },
  online_win: { tier: 'gold', glyph: 'globe' },
  daily_first: { tier: 'bronze', glyph: 'calendar' },
  daily_3: { tier: 'silver', glyph: 'calendar' },
  daily_7: { tier: 'special', glyph: 'crown' },
}

export function Badge({ id, unlocked, size = 52 }: { id: string; unlocked: boolean; size?: number }) {
  const a = ACH[id] ?? { tier: 'bronze' as Tier, glyph: 'star' as IconName }
  const isNum = !(a.glyph in SHAPES)
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={`badge ${a.tier} ${unlocked ? 'on' : 'off'}`} aria-hidden="true">
      <polygon points="24,2 43,13 43,35 24,46 5,35 5,13" fill={unlocked ? `url(#g-${a.tier})` : 'url(#g-locked)'} />
      <polygon points="24,6 39.500,15 39.500,33 24,42 8.500,33 8.500,15" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.200" />
      {unlocked && <polygon points="24,2 43,13 24,24 5,13" fill="rgba(255,255,255,.22)" />}
      <g color={unlocked ? '#2b1d00' : '#6c8277'} style={{ ['--cut' as string]: unlocked ? '#fff3cf' : '#1a2f27' }}>
        {unlocked ? (
          isNum ? (
            <text x="24" y="31.500" textAnchor="middle" fontSize="22" fontWeight="900" fontFamily="Georgia, serif" fill="currentColor">
              {a.glyph}
            </text>
          ) : (
            <g transform="translate(11 11) scale(.82)" fill="currentColor">
              {SHAPES[a.glyph]}
            </g>
          )
        ) : (
          <g transform="translate(14.500 14.500) scale(.62)" fill="currentColor">
            {SHAPES.lock}
          </g>
        )}
      </g>
    </svg>
  )
}

/** Render once near the app root: gradients referenced by badges. */
export function IconDefs() {
  const grad = (id: string, stops: [number, string][]) => (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  )
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {grad('g-bronze', [[0, '#f0b27a'], [0.55, '#cd7f32'], [1, '#8a4b12']])}
        {grad('g-silver', [[0, '#f4f8fb'], [0.55, '#b9c4cd'], [1, '#7e8b96']])}
        {grad('g-gold', [[0, '#fff0b3'], [0.5, '#f2c14e'], [1, '#b9830f']])}
        {grad('g-special', [[0, '#7be0ff'], [0.5, '#c78bff'], [1, '#ff5ea8']])}
        {grad('g-locked', [[0, '#2c4a3f'], [1, '#1a2f27']])}
      </defs>
    </svg>
  )
}
