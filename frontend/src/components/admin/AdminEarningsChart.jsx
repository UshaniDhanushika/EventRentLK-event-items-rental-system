import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const money = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const STEP = 550

export default function AdminEarningsChart({ data }) {
  const chartData = (data || []).map((d) => ({
    label: d.label,
    amount: Number(d.amount),
  }))

  const maxVal = Math.max(0, ...chartData.map((d) => d.amount))
  let tickStep = STEP
  let domainMax = Math.max(2200, Math.ceil(maxVal / tickStep) * tickStep || 2200)
  let tickCount = Math.floor(domainMax / tickStep) + 1
  while (tickCount > 10) {
    tickStep *= 2
    domainMax = Math.max(tickStep * 4, Math.ceil(maxVal / tickStep) * tickStep)
    tickCount = Math.floor(domainMax / tickStep) + 1
  }
  const yTicks = Array.from({ length: tickCount }, (_, i) => i * tickStep)

  return (
    <div className="owner-chart-wrap">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={chartData}
          margin={{ top: 12, right: 12, left: 4, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="var(--chart-grid)"
            vertical
          />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            domain={[0, domainMax]}
            ticks={yTicks}
            tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={{ stroke: 'var(--border)' }}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--text)',
            }}
            formatter={(value) => [money.format(value), 'Earnings']}
            labelFormatter={(l) => l}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#21a1d9"
            strokeWidth={2.5}
            dot={{ fill: '#21a1d9', strokeWidth: 0, r: 5 }}
            activeDot={{ r: 7, fill: '#21a1d9' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
