function buildYScale(maxValue) {
  const m = Math.max(Number(maxValue) || 0, 1)
  const rawStep = m / 4
  const exp = Math.floor(Math.log10(rawStep))
  const pow10 = 10 ** Math.max(exp, 0)
  const step = Math.max(50, Math.ceil(rawStep / pow10) * pow10)
  const yMax = step * 4
  const ticks = [0, step, step * 2, step * 3, step * 4]
  return { yMax, ticks }
}

export default function EarningsChart({ points }) {
  const totals = (points || []).map((p) => Number(p.total) || 0)
  const maxVal = totals.length ? Math.max(...totals) : 0
  const { yMax, ticks } = buildYScale(maxVal)

  const w = 520
  const h = 220
  const padL = 52
  const padR = 20
  const padT = 16
  const padB = 36
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const n = Math.max(totals.length, 1)

  const coords = totals.map((v, i) => {
    const x = padL + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1))
    const y = padT + innerH * (1 - v / yMax)
    return { x, y, v }
  })

  const lineD = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`)
    .join(' ')
  const areaD =
    coords.length > 0
      ? `${lineD} L ${coords[coords.length - 1].x} ${padT + innerH} L ${coords[0].x} ${padT + innerH} Z`
      : ''

  const labels = (points || []).map((p) => p.label)

  return (
    <svg
      className="owner-chart-svg"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Monthly earnings chart"
    >
      {ticks.map((t) => {
        const y = padT + innerH * (1 - t / yMax)
        return (
          <g key={t}>
            <line
              x1={padL}
              y1={y}
              x2={padL + innerW}
              y2={y}
              className="owner-chart-grid"
            />
            <text x={padL - 8} y={y + 4} className="owner-chart-y-label" textAnchor="end">
              {t}
            </text>
          </g>
        )
      })}

      {labels.map((label, i) => {
        const x = padL + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1))
        return (
          <text
            key={label}
            x={x}
            y={h - 10}
            className="owner-chart-x-label"
            textAnchor="middle"
          >
            {label}
          </text>
        )
      })}

      {areaD && (
        <path d={areaD} className="owner-chart-area" fill="url(#ownerEarningsGrad)" />
      )}
      {lineD && <path d={lineD} className="owner-chart-line" fill="none" />}
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={5} className="owner-chart-dot" />
      ))}

      <defs>
        <linearGradient id="ownerEarningsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
    </svg>
  )
}
