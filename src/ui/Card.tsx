import type { CSSProperties } from 'react'
import { SUIT_NAME, SUIT_SYMBOL, cardById, cardPoints, rankLabel } from '../engine/cards'

interface Props {
  id?: number
  faceDown?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

export function Card({ id, faceDown, onClick, disabled, className = '', style }: Props) {
  if (faceDown || id === undefined)
    return <div className={`card back ${className}`} style={style} aria-label="face-down card" />

  const c = cardById(id)
  const sym = SUIT_SYMBOL[c.suit]
  const red = c.suit === 'H' || c.suit === 'D'
  const big = c.rank > 10 || c.rank === 1
  const cls = `card face ${red ? 'red' : 'black'} ${cardPoints(id) > 0 ? 'pts' : ''} ${
    onClick && !disabled ? 'clickable' : ''
  } ${className}`
  const label = `${rankLabel(c.rank)} of ${SUIT_NAME[c.suit]}`
  const body = (
    <>
      <span className="corner tl">
        {rankLabel(c.rank)}
        <small>{sym}</small>
      </span>
      <span className="center">{big ? rankLabel(c.rank) : sym}</span>
      {big && <span className="center-suit">{sym}</span>}
      <span className="corner br">
        {rankLabel(c.rank)}
        <small>{sym}</small>
      </span>
    </>
  )
  if (onClick)
    return (
      <button type="button" className={cls} style={style} onClick={onClick} disabled={disabled} aria-label={`Play ${label}`}>
        {body}
      </button>
    )
  return (
    <div className={cls} style={style} aria-label={label}>
      {body}
    </div>
  )
}
