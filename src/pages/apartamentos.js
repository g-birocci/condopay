import { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import API from "@/services/api";

export default function Apartamentos() {
  const [apartamentos, setApartamentos] = useState([]);
  const [selectedAp, setSelectedAp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApartamentos();
  }, []);

  const loadApartamentos = async () => {
    try {
      const response = await API.get("/apartamentos");
      setApartamentos(response.data);
    } catch (error) {
      console.error("Erro ao carregar apartamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const pagar = async (ap) => {
    try {
      await API.post(`/apartamentos/${ap._id}/pay`, { amount: ap.valor || 0.01 });
      alert(`Pagamento confirmado para Ap ${ap.numeroAp}.`);
      await loadApartamentos();
    } catch (e) {
      console.error("Erro ao pagar boleto:", e);
      alert("Falha ao registrar pagamento.");
    }
  };

  const notificar = async (ap) => {
    try {
      await API.post(`/apartamentos/${ap._id}/notify`);
      alert(`Simulação: e-mail enviado para ${ap.residenteEmail || "morador"} (Ap ${ap.numeroAp}).`);
      await loadApartamentos();
    } catch (e) {
      console.error("Erro ao notificar:", e);
      alert("Falha ao enviar notificação.");
    }
  };

  const DetalhesModal = ({ apartamento, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Detalhes do Apartamento</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Número</p>
            <p className="font-medium">{apartamento.numeroAp}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Andar</p>
            <p className="font-medium">{apartamento.andar}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Morador</p>
            <p className="font-medium">{apartamento.residenteNome || "-"} ({apartamento.residenteEmail || "-"})</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Vencimento</p>
            <p className="font-medium">{new Date(apartamento.dueDate).toLocaleDateString()}</p>
          </div>

          <div className="text-sm text-gray-500">Status</div>
          <span className={`inline-block px-2 py-1 rounded-full text-sm ${apartamento.pagamento ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {apartamento.pagamento ? "Pago" : "Pendente"}
          </span>

          {apartamento.history && apartamento.history.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Histórico de Pagamentos</p>
              <div className="space-y-2">
                {apartamento.history.map((p, i) => (
                  <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                    <p>Data: {new Date(p.date).toLocaleDateString()}</p>
                    <p>Valor: R$ {typeof p.amount === 'number' ? p.amount.toFixed(2) : p.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!apartamento.pagamento && (
              <button onClick={() => pagar(apartamento)} className="px-3 py-2 bg-blue-600 text-white rounded">Pagar</button>
            )}
            {!apartamento.pagamento && (
              <button onClick={() => notificar(apartamento)} className="px-3 py-2 bg-yellow-500 text-white rounded">Notificar</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Apartamentos • CondoPay</title>
      </Head>

      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Apartamentos</h1>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {apartamentos.map((ap) => (
              <div
                key={ap._id}
                onClick={() => setSelectedAp(ap)}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Apartamento {ap.numeroAp}</h3>
                    <p className="text-sm text-gray-500">Andar {ap.andar}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${ap.pagamento ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {ap.pagamento ? "Pago" : "Pendente"}
                  </span>
                </div>
                <p className="text-sm mt-2">{ap.residenteNome || '-'}</p>
                <p className="text-xs text-gray-500 mt-1">Vencimento: {new Date(ap.dueDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {selectedAp && (
          <DetalhesModal apartamento={selectedAp} onClose={() => setSelectedAp(null)} />
        )}
      </main>
    </div>
  );
}

