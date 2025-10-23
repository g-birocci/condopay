import { useEffect, useState } from "react";
import API from "../services/api";
import ApEditorModal from "./ApEditorModal";

export default function Dashboard() {
  // Estados para o relatório geral
  const [report, setReport] = useState(null);

  // Estados para gerenciamento de apartamentos
  const [apartamentos, setApartamentos] = useState([]);
  const [showLista, setShowLista] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [apartamentoEmEdicao, setApartamentoEmEdicao] = useState(null);
  const [selectedAp, setSelectedAp] = useState(null);

  // Função para carregar a lista de apartamentos
  const carregarApartamentos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/apartamentos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApartamentos(response.data);
    } catch (error) {
      console.error("Erro ao carregar apartamentos:", error);
    }
  };

  // Função para abrir o modal de edição
  const abrirEdicao = (apartamento) => {
    setApartamentoEmEdicao(apartamento);
    setShowEditModal(true);
  };

  // Abrir detalhes ao clicar na linha
  const abrirDetalhes = (apartamento) => {
    setSelectedAp(apartamento);
  };

  const fecharDetalhes = () => setSelectedAp(null);

  // Função para carregar dados
  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Carregar relatório e apartamentos em paralelo
      const [reportRes, apartamentosRes] = await Promise.all([
        API.get("/report/overview", { headers }),
        API.get("/apartamentos", { headers }),
      ]);

      setReport(reportRes.data);
      setApartamentos(apartamentosRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  // Função para atualizar apartamento
  const atualizarApartamento = async (dados) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(`/apartamentos/${dados._id}`, dados, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Recarrega os dados após atualização
      await loadData();
      setShowEditModal(false);
      setApartamentoEmEdicao(null);
    } catch (error) {
      console.error("Erro ao atualizar apartamento:", error);
      alert("Erro ao atualizar apartamento. Tente novamente.");
    }
  };

  // Ações: pagar e notificar
  const pagar = async (ap) => {
    try {
      await API.post(`/apartamentos/${ap._id}/pay`, { amount: ap.valor || 0.01 });
      await loadData();
    } catch (e) {
      console.error("Erro ao pagar boleto:", e);
      alert("Falha ao registrar pagamento.");
    }
  };

  const notificar = async (ap) => {
    try {
      await API.post(`/apartamentos/${ap._id}/notify`);
      await loadData();
    } catch (e) {
      console.error("Erro ao notificar:", e);
      alert("Falha ao enviar notificação.");
    }
  };

  // Função para fechar o modal
  const fecharModal = () => {
    setShowEditModal(false);
    setApartamentoEmEdicao(null);
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      {!report ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded shadow">
            Total Collected: ${report.totalCollected}
          </div>
          <div className="p-4 bg-white rounded shadow">
            Payments: {report.paymentsCount}
          </div>
        </div>
      )}

      {/* Botão para mostrar/esconder lista */}
      <button
        onClick={() => setShowLista(!showLista)}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {showLista ? "Esconder Lista" : "Mostrar Apartamentos"}
      </button>

      {/* Lista de Apartamentos */}
      {showLista && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Lista de Apartamentos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Andar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Morador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {apartamentos.map((ap) => (
                  <tr
                    key={ap._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => abrirDetalhes(ap)}
                  >
                    <td className="px-6 py-4 text-sm">{ap.numeroAp}</td>
                    <td className="px-6 py-4 text-sm">{ap.andar}</td>
                    <td className="px-6 py-4 text-sm">{ap.residenteNome || '-'}</td>
                    <td className="px-6 py-4 text-sm">{ap.dueDate ? new Date(ap.dueDate).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${ap.pagamento ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {ap.pagamento ? "Pago" : "Pendente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirEdicao(ap); }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedAp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalhes do Apartamento</h3>
              <button onClick={fecharDetalhes} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Número</p>
                <p className="font-medium">{selectedAp.numeroAp}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Andar</p>
                <p className="font-medium">{selectedAp.andar}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Morador</p>
                <p className="font-medium">{selectedAp.residenteNome || '-'} ({selectedAp.residenteEmail || '-'})</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vencimento</p>
                <p className="font-medium">{selectedAp.dueDate ? new Date(selectedAp.dueDate).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-sm ${selectedAp.pagamento ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {selectedAp.pagamento ? "Pago" : "Pendente"}
                </span>
              </div>
              {Array.isArray(selectedAp.history) && selectedAp.history.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Histórico de Pagamentos</p>
                  <div className="space-y-1 max-h-40 overflow-auto pr-1">
                    {selectedAp.history.map((p, i) => (
                      <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                        <p>Data: {new Date(p.date).toLocaleDateString()}</p>
                        <p>Valor: R$ {typeof p.amount === 'number' ? p.amount.toFixed(2) : p.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between gap-2">
              <div className="flex gap-2">
                {!selectedAp.pagamento && (
                  <button onClick={() => pagar(selectedAp)} className="px-3 py-2 rounded bg-green-600 text-white">Marcar como pago</button>
                )}
                {!selectedAp.pagamento && (
                  <button onClick={() => notificar(selectedAp)} className="px-3 py-2 rounded bg-yellow-500 text-white">Notificar</button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={fecharDetalhes} className="px-3 py-2 rounded border">Fechar</button>
                <button
                  onClick={() => { const ap = selectedAp; fecharDetalhes(); abrirEdicao(ap); }}
                  className="px-3 py-2 rounded bg-blue-600 text-white"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição (usar ApEditorModal padronizado) */}
      {showEditModal && apartamentoEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <ApEditorModal
            apartamento={apartamentoEmEdicao}
            onClose={fecharModal}
            onSave={atualizarApartamento}
            onPay={pagar}
            onNotify={notificar}
          />
        </div>
      )}
    </div>
  );
}
