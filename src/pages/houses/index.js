import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

export default function HousesList({ apartments = [] }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Apartamentos • CondoPay</title>
      </Head>

      <NavBar />

      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Apartamentos</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Voltar</Link>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Número</th>
                <th className="text-left px-4 py-3">Andar</th>
                <th className="text-left px-4 py-3">Vencimento</th>
                <th className="text-left px-4 py-3">Pagamento</th>
                <th className="text-left px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {apartments.map((a) => (
                <tr key={a._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/houses/${a._id}`} className="text-blue-600 hover:underline">{a.numeroAp}</Link>
                  </td>
                  <td className="px-4 py-3">{a.andar}</td>
                  <td className="px-4 py-3">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">{a.pagamento ? 'Pago' : 'Em atraso'}</td>
                  <td className="px-4 py-3">
                    {!a.pagamento && (
                      <button onClick={async () => {
                        const res = await fetch(`/api/apartamentos/${a._id}/notify`, { method: 'POST' });
                        if (res.ok) alert('Morador notificado (simulado)');
                        else alert('Erro ao notificar');
                      }} className="text-sm bg-yellow-100 px-3 py-1 rounded">Notificar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const base = `${protocol}://localhost:${process.env.PORT || 3000}`;
  try {
    const res = await fetch(`${base}/api/apartamentos`);
    const apartments = await res.json();
    return { props: { apartments } };
  } catch (err) {
    console.error('Erro ao buscar apartamentos', err);
    return { props: { apartments: [] } };
  }
}
