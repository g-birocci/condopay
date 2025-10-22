import NavBar from '@/components/NavBar';
import HomeChart from '@/components/HomeChart';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export default function Home() {
  // Dados de demonstração para o gráfico
  const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const paidData = [12, 19, 7, 15, 22, 18];
  const owedData = [5, 9, 14, 8, 6, 10];

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-zinc-50 font-sans`}>
      <NavBar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold mb-4">Resumo</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="h-40 bg-white rounded-xl shadow flex flex-col items-center justify-center p-6">
            <span className="text-xl font-semibold">Cobranças</span>
            <span className="text-3xl text-blue-600 mt-2">R$ 12.400</span>
          </button>

          <button className="h-40 bg-white rounded-xl shadow flex flex-col items-center justify-center p-6">
            <span className="text-xl font-semibold">Recebidos</span>
            <span className="text-3xl text-green-600 mt-2">R$ 9.800</span>
          </button>

          <button className="h-40 bg-white rounded-xl shadow flex flex-col items-center justify-center p-6">
            <span className="text-xl font-semibold">Em atraso</span>
            <span className="text-3xl text-red-600 mt-2">R$ 2.600</span>
          </button>
        </div>

        <HomeChart labels={labels} paidData={paidData} owedData={owedData} />
      </main>
    </div>
  );
}
