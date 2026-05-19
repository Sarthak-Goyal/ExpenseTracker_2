import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register the Chart.js components we use
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * TrendsChart — grouped bar chart showing monthly income vs expenses.
 * Aggregates entries by year-month and renders using react-chartjs-2.
 */
export default function TrendsChart({ entries }) {
  // Group entries by "YYYY-MM"
  const monthly = {};
  entries.forEach((entry) => {
    const d   = new Date(entry.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthly[key]) monthly[key] = { income: 0, expense: 0 };
    if (entry.type === 'income')  monthly[key].income  += Number(entry.amount);
    if (entry.type === 'expense') monthly[key].expense += Number(entry.amount);
  });

  const sortedKeys = Object.keys(monthly).sort();
  const labels     = sortedKeys.map((k) => {
    const [year, month] = k.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: sortedKeys.map((k) => monthly[k].income),
        backgroundColor: 'rgba(75, 122, 95, 0.75)',
        borderColor:     'rgba(75, 122, 95, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Expenses',
        data: sortedKeys.map((k) => monthly[k].expense),
        backgroundColor: 'rgba(122, 75, 75, 0.75)',
        borderColor:     'rgba(122, 75, 75, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: { label: (ctx) => ` $${ctx.parsed.y.toFixed(2)}` },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => `$${v}` } },
    },
  };

  if (sortedKeys.length === 0) {
    return (
      <div className="card mt-2">
        <h2>Monthly Trends</h2>
        <p className="empty-state">No data to display yet.</p>
      </div>
    );
  }

  return (
    <div className="card mt-2">
      <h2 style={{ marginBottom: 16 }}>Monthly Expenditure Trends</h2>
      <div style={{ height: 260 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
