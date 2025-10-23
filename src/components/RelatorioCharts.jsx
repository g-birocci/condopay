import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title as ChartTitle } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle);

export default function RelatorioCharts({ apartamentos = [] }) {
  const total = apartamentos.length;
  const pagos = apartamentos.filter((a) => a.pagamento).length;
  const pendentes = total - pagos;

  const valoresPagos = apartamentos.filter(a=>a.pagamento).reduce((s,a)=>s+(Number(a.valor)||0),0);
  const valoresPendentes = apartamentos.filter(a=>!a.pagamento).reduce((s,a)=>s+(Number(a.valor)||0),0);

  const donutData = {
    labels: ['Pagos', 'Pendentes'],
    datasets: [{ data: [pagos, pendentes], backgroundColor: ['#16a34a', '#ef4444'] }]
  };

  const barData = {
    labels: ['Pagos', 'Pendentes'],
    datasets: [{ label: 'Valor (R$)', data: [valoresPagos, valoresPendentes], backgroundColor: ['#60a5fa', '#f59e0b'] }]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="p-4 border rounded-xl">
        <h4 className="mb-3 font-medium">Status dos Boletos</h4>
        <Doughnut data={donutData} />
        <p className="mt-3 text-sm text-gray-600">Total: {total} • Pagos: {pagos} • Pendentes: {pendentes}</p>
      </div>
      <div className="p-4 border rounded-xl">
        <h4 className="mb-3 font-medium">Valores</h4>
        <Bar data={barData} options={{ plugins:{ legend:{ position:'bottom' } }, scales:{ y:{ beginAtZero:true } } }} />
        <p className="mt-3 text-sm text-gray-600">Pagos R$ {valoresPagos.toFixed(2)} • Pendentes R$ {valoresPendentes.toFixed(2)}</p>
      </div>
    </div>
  );
}

