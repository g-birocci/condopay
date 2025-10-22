import { useEffect, useState } from "react";
import API from "../lib/api";

export default function Dashboard() {
  // Estados para o relatório geral
  const [report, setReport] = useState(null);

  // Estados para gerenciamento de apartamentos
  const [apartamentos, setApartamentos] = useState([]);
  const [showLista, setShowLista] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [apartamentoEmEdicao, setApartamentoEmEdicao] = useState(null);

  // Função para carregar a lista de apartamentos
  const carregarApartamentos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/api/apartamentos", {
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

  // Função para carregar dados
  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Carregar relatório e apartamentos em paralelo
      const [reportRes, apartamentosRes] = await Promise.all([
        API.get("/report/overview", { headers }),
        API.get("/api/apartamentos", { headers }),
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
      await API.put(`/api/apartamentos/${dados._id}`, dados, {
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
                    Bloco
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Proprietário
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
                  <tr key={ap._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{ap.numero}</td>
                    <td className="px-6 py-4 text-sm">{ap.bloco}</td>
                    <td className="px-6 py-4 text-sm">{ap.proprietario}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(ap.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          ap.status === "Pago"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {ap.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => abrirEdicao(ap)}
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

      {/* Modal de Edição */}
      {showEditModal && apartamentoEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Editar Apartamento</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const dadosAtualizados = {
                  ...apartamentoEmEdicao,
                  numero: formData.get("numero"),
                  bloco: formData.get("bloco"),
                  proprietario: formData.get("proprietario"),
                  dueDate: formData.get("dueDate"),
                  status: formData.get("status"),
                };
                atualizarApartamento(dadosAtualizados);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número
                  </label>
                  <input
                    type="text"
                    name="numero"
                    defaultValue={apartamentoEmEdicao.numero}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bloco
                  </label>
                  <input
                    type="text"
                    name="bloco"
                    defaultValue={apartamentoEmEdicao.bloco}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Proprietário
                  </label>
                  <input
                    type="text"
                    name="proprietario"
                    defaultValue={apartamentoEmEdicao.proprietario}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={apartamentoEmEdicao.dueDate?.split("T")[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={apartamentoEmEdicao.status}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                    required
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
