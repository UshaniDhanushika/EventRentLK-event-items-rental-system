import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

const COLORS = ['#560BAD', '#7209B7', '#B5179E', '#F72585', '#480CA8', '#3F37C9', '#4361EE', '#4CC9F0']

export default function AdminCategoryChart({ data }) {
  const chartData = (data || []).map((d) => ({
    name: d.category,
    value: Number(d.revenue),
  }))

  return (
    <div className="owner-chart-wrap">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}
             formatter={(val) => [`$${val.toFixed(2)}`, 'Revenue']}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
