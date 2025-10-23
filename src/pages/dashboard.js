import { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "@/components/NavBar";
import AddAp from "@/components/AddAp";
import API from "@/services/api";
import ApEditorModal from "@/components/ApEditorModal";
import RelatorioCharts from "@/components/RelatorioCharts";

export default function Dashboard() {
  const [apartamentos, setApartamentos] = useState([]);
  const [selectedAp, setSelectedAp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("apartamentos");
  const [showAddModal, setShowAddModal] = useState(false);

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

  useEffect(() => { loadApartamentos(); }, []);

  // SSE para admin: atualiza lista ao receber pagamentos
  useEffect(() => {
    const es = new EventSource('/api/events?role=admin');
    const onPayment = () => { loadApartamentos(); };
    es.addEventListener('payment', onPayment);
    return () => { es.removeEventListener('payment', onPayment); es.close(); };
  }, []);

  const pagar = async (ap) => {
    try {
      await API.post(`/apartamentos/${ap._id}/pay`, { amount: ap.valor || 0.01 });
      alert(`Pagamento confirmado para Ap ${ap.numeroAp}.`);
      await loadApartamentos();
    } catch {
      alert("Falha ao registrar pagamento.");
    }
  };

  const notificar = async (ap) => {
    try {
      await API.post(`/apartamentos/${ap._id}/notify`);
      alert(`Notificação enviada para ${ap.residenteEmail || "morador"} (Ap ${ap.numeroAp}).`);
    } catch {
      alert("Falha ao enviar notificação.");
    }
  };

  const editarApartamento = async (dados) => {
    try {
      const payload = {
        numeroAp: dados.numeroAp,
        andar: dados.andar,
        residenteNome: dados.residenteNome,
        residenteEmail: dados.residenteEmail,
        dueDate: new Date(dados.dueDate).toISOString(),
      };
      await API.put(`/apartamentos/${dados._id}`, payload);
      alert("Apartamento atualizado com sucesso!");
      await loadApartamentos();
      setSelectedAp(null);
    } catch (e) {
      console.error("Erro ao atualizar apartamento:", e);
      alert("Erro ao atualizar apartamento. Verifique o console.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
      <Head>
        <title>Dashboard • CondoPay</title>
      </Head>

      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-8 transition-all">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          <div className="grid grid-cols-12">
            <aside className="col-span-12 md:col-span-3 bg-gradient-to-b from-gray-100 to-gray-200 p-6 border-r">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">🏢</span>
                <h1 className="font-semibold text-lg tracking-tight">Condo</h1>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setTab("apartamentos")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    tab === "apartamentos"
                      ? "bg-blue-600 text-white font-medium shadow-sm"
                      : "hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Apartamentos
                </button>
                <button
                  onClick={() => setTab("relatorios")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition ${
                    tab === "relatorios"
                      ? "bg-blue-600 text-white font-medium shadow-sm"
                      : "hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Relatórios
                </button>
              </div>
            </aside>

            <section className="col-span-12 md:col-span-9 bg-white">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold tracking-tight">
                  {tab === "apartamentos" ? "Apartamentos" : "Relatórios"}
                </h2>

                {tab === "apartamentos" && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow transition-all hover:scale-105"
                    title="Adicionar Apartamento"
                  >
                    <span className="text-2xl leading-none">+</span>
                  </button>
                )}
              </div>

              <div className="p-6">
                {loading ? (
                  <p className="text-gray-500">Carregando...</p>
                ) : tab === "apartamentos" ? (
                  <ApartamentosGrid apartamentos={apartamentos} onSelect={setSelectedAp} onNotify={notificar} />
                ) : (
                  <RelatorioCharts apartamentos={apartamentos} />
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {showAddModal && (
        <Modal>
          <AddAp onClose={() => setShowAddModal(false)} />
        </Modal>
      )}

      {selectedAp && (
        <Modal>
          <ApEditorModal
            apartamento={selectedAp}
            onClose={() => setSelectedAp(null)}
            onSave={editarApartamento}
            onPay={pagar}
            onNotify={notificar}
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({ children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      {children}
    </div>
  );
}

function ApartamentosGrid({ apartamentos, onSelect, onNotify }) {
  if (!apartamentos.length)
    return (
      <p className="text-center text-gray-500 py-6">
        Nenhum apartamento cadastrado ainda.
      </p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {apartamentos.map((ap) => (
        <div
          key={ap._id}
          onClick={() => onSelect(ap)}
          className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-800">
                Apartamento {ap.numeroAp}
              </h3>
              <p className="text-sm text-gray-500">Andar {ap.andar}</p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                ap.pagamento
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {ap.pagamento ? "Pago" : "Pendente"}
            </span>
          </div>
          <p className="text-sm mt-3 text-gray-700">
            {ap.residenteNome || "-"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Vencimento: {new Date(ap.dueDate).toLocaleDateString()}
          </p>
          {!ap.pagamento && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onNotify?.(ap); }}
                className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-sm"
              >
                Notificar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EditarModal({ apartamento, onClose, onSave, onPay, onNotify }) {
  return null;
}

function RelatorioSimples() {
  return <div className="text-gray-600">Relatórios simples (em construção)</div>;
}
