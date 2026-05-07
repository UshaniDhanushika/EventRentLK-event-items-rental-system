import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts'

const COLORS = ['#560BAD', '#7209B7', '#B5179E', '#F72585', '#480CA8', '#3F37C9', '#4361EE', '#4CC9F0']

export default function AdminTopItemsChart({ data }) {
  const chartData = (data || []).map((d) => ({
    name: d.equipmentName,
    count: d.rentalCount,
  }))

  return (
    <div className="owner-chart-wrap">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--chart-grid)" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={120} 
            tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}
            formatter={(val) => [val, 'Total Rented']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
