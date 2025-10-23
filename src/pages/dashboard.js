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
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);

  const loadApartamentos = async () => {
    try {
      const response = await API.get("/apartamentos");
      setApartamentos(response.data);
    } catch (error) {
      console.error("Erro ao carregar apartamentos:", error);
      // Se não conseguir carregar dados reais, usa dados de demonstração
      console.log("Usando dados de demonstração...");
      const { demoApartamentos } = await import('../../demo-data');
      setApartamentos(demoApartamentos);
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
      
      // Feedback visual melhorado
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      notification.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔔</span>
          <div>
            <div class="font-semibold">Notificação Enviada!</div>
            <div class="text-sm opacity-90">Ap ${ap.numeroAp} - ${ap.residenteEmail || "morador"}</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Anima a notificação
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);
      
      // Remove após 4 segundos
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 4000);
      
    } catch (error) {
      // Feedback de erro
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      errorNotification.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">❌</span>
          <div>
            <div class="font-semibold">Erro ao Enviar</div>
            <div class="text-sm opacity-90">Tente novamente em alguns instantes</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        errorNotification.style.transform = 'translateX(0)';
      }, 100);
      
      setTimeout(() => {
        errorNotification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          document.body.removeChild(errorNotification);
        }, 300);
      }, 4000);
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
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowOnlyUnpaid(!showOnlyUnpaid)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        showOnlyUnpaid
                          ? "bg-red-600 text-white shadow-md"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {showOnlyUnpaid ? "Mostrar Todos" : "Apenas Não Pagos"}
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow transition-all hover:scale-105"
                      title="Adicionar Apartamento"
                    >
                      <span className="text-2xl leading-none">+</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6">
                {loading ? (
                  <p className="text-gray-500">Carregando...</p>
                ) : tab === "apartamentos" ? (
                  <ApartamentosGrid 
                    apartamentos={showOnlyUnpaid ? apartamentos.filter(ap => !ap.pagamento) : apartamentos} 
                    onSelect={setSelectedAp} 
                    onNotify={notificar}
                    showOnlyUnpaid={showOnlyUnpaid}
                  />
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

function ApartamentosGrid({ apartamentos, onSelect, onNotify, showOnlyUnpaid }) {
  if (!apartamentos.length)
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-gray-400 text-3xl">
            {showOnlyUnpaid ? "🎉" : "🏠"}
          </span>
        </div>
        <p className="text-gray-500 text-lg">
          {showOnlyUnpaid 
            ? "Todos os apartamentos estão em dia!" 
            : "Nenhum apartamento cadastrado ainda."
          }
        </p>
        <p className="text-gray-400 text-sm mt-2">
          {showOnlyUnpaid 
            ? "Parabéns! Todos os pagamentos estão em dia." 
            : "Adicione apartamentos para começar a gerenciar."
          }
        </p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apartamentos.map((ap) => (
        <div
          key={ap._id}
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
