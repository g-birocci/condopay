import Head from 'next/head';
import NavBar from '@/components/NavBar';

export default function ApartmentDetail({ apartment = null }) {
  if (!apartment) return <div>Não encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Apartamento {apartment.numeroAp} • CondoPay</title>
      </Head>

      <NavBar />

      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Apartamento {apartment.numeroAp}</h1>

        <div className="bg-white rounded-xl shadow p-6">
          <p><strong>Andar:</strong> {apartment.andar}</p>
          <p><strong>Pagamento:</strong> {apartment.pagamento ? 'Pago' : 'Em atraso'}</p>
          <p><strong>Data de pagamento:</strong> {apartment.dataPagamento ? new Date(apartment.dataPagamento).toLocaleString() : '-'}</p>
          <p><strong>Vencimento:</strong> {apartment.dueDate ? new Date(apartment.dueDate).toLocaleDateString() : '-'}</p>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={async () => {
              const res = await fetch(`/api/apartamentos/${apartment._id}/notify`, { method: 'POST' });
              if (res.ok) alert('Morador notificado (simulado)');
              else alert('Erro ao notificar');
            }} className="px-4 py-2 bg-yellow-100 rounded">Notificar</button>

            {!apartment.pagamento && (
              <button onClick={async () => {
                const amount = parseFloat(prompt('Valor pago (R$):', '0')) || 0;
                const res = await fetch(`/api/apartamentos/${apartment._id}/pay`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ amount })
                });
                if (res.ok) {
                  alert('Pagamento registrado (simulado)');
                  location.reload();
                } else alert('Erro ao registrar pagamento');
              }} className="px-4 py-2 bg-green-100 rounded">Marcar pagamento</button>
            )}
          </div>

          <hr className="my-4" />

          <h2 className="text-lg font-semibold">Histórico de pagamentos</h2>
          {apartment.history && apartment.history.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {apartment.history.map((h, i) => (
                <li key={i} className="text-sm border p-2 rounded">
                  <div><strong>Valor:</strong> R$ {h.amount.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">{new Date(h.date).toLocaleString()}</div>
                  {h.note && <div className="text-xs">{h.note}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-500">Nenhum pagamento registrado</p>
          )}

          <hr className="my-4" />

          <h2 className="text-lg font-semibold">Inquilino</h2>
          {apartment.inquilino ? (
            <div className="mt-2">
              <p><strong>Nome:</strong> {apartment.inquilino.nome || '-'}</p>
              <p><strong>Email:</strong> {apartment.inquilino.email || '-'}</p>
              <p><strong>Telefone:</strong> {apartment.inquilino.telefone || '-'}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">Sem dados do inquilino</p>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const base = `${protocol}://localhost:${process.env.PORT || 3000}`;
  try {
    const res = await fetch(`${base}/api/apartamentos/${id}`);
    if (res.status === 404) return { notFound: true };
    const apartment = await res.json();
    return { props: { apartment } };
  } catch (err) {
    console.error('Erro ao buscar apartamento', err);
    return { props: { apartment: null } };
  }
}
