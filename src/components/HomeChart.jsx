import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HomeChart({ paidData = [], owedData = [], labels = [] }) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Pagantes',
        data: paidData,
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.3,
      },
      {
        label: 'Devedores',
        data: owedData,
        borderColor: 'rgba(239,68,68,1)',
        backgroundColor: 'rgba(239,68,68,0.2)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <Line data={data} options={options} />
    </div>
  );
}
