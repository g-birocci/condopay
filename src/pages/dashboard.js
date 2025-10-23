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
      notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 transform translate-x-full transition-transform duration-300';
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
      errorNotification.className = 'fixed top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 transform translate-x-full transition-transform duration-300';
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
          className="bg-white/80 backdrop-blur-md border border-white/20 rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🏠</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    Ap {ap.numeroAp}
                  </h3>
                  <p className="text-sm text-gray-500">Andar {ap.andar}</p>
                </div>
              </div>
              
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  ap.pagamento
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {ap.pagamento ? "✅ Pago" : "⚠️ Pendente"}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">👤</span>
                <span className="text-sm text-gray-700">
                  {ap.residenteNome || "Morador não informado"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📅</span>
                <span className="text-sm text-gray-700">
                  Vence em {new Date(ap.dueDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-500">💰</span>
                <span className="text-sm font-semibold text-blue-600">
                  R$ {(ap.valor || 0).toFixed(2)}
                </span>
              </div>
            </div>
            
            {!ap.pagamento ? (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(ap); }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
                >
                  📝 Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onNotify?.(ap); }}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                >
                  <span>🔔</span>
                  Notificar
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(ap); }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-sm font-medium"
                >
                  📝 Ver Detalhes
                </button>
              </div>
            )}
          </div>
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
