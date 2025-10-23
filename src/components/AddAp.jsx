// src/components/AddAp.jsx
import { useState } from "react";
import API from "../services/api";

export default function AddAp({ onClose }) {
  const [numeroAp, setNumeroAp] = useState("");
  const [andar, setAndar] = useState("");
  const [pagamento, setPagamento] = useState(false);
  const [residenteNome, setResidenteNome] = useState("");
  const [residenteEmail, setResidenteEmail] = useState("");
  const [valor, setValor] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await API.post("/apartamentos", {
        numeroAp: numeroAp.trim(),
        andar: Number(andar),
        pagamento,
        residenteNome: residenteNome.trim(),
        residenteEmail: residenteEmail.trim(),
        valor: valor ? Number(valor) : 0,
        dueDate: dueDate || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose?.();
      }, 1200);

      setNumeroAp("");
      setAndar("");
      setPagamento(false);
      setResidenteNome("");
      setResidenteEmail("");
      setValor("");
      setDueDate("");
    } catch (err) {
      console.error("Erro ao adicionar apartamento:", err);
      const msg = err.response?.data?.error || "Não foi possível adicionar o apartamento.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-gray-200 max-w-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Adicionar Apartamento</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          Apartamento adicionado com sucesso!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">Erro: {error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número do Apartamento</label>
          <input
            type="text"
            value={numeroAp}
            onChange={(e) => setNumeroAp(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 101, 205"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Andar</label>
          <input
            type="number"
            min="0"
            value={andar}
            onChange={(e) => setAndar(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Morador</label>
          <input
            type="text"
            value={residenteNome}
            onChange={(e) => setResidenteNome(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: João Silva"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail do Morador</label>
          <input
            type="email"
            value={residenteEmail}
            onChange={(e) => setResidenteEmail(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="exemplo@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Boleto (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 350.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="pagamento"
            checked={pagamento}
            onChange={(e) => setPagamento(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="pagamento" className="ml-2 text-sm font-medium text-gray-700">
            Pagamento efetuado?
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Salvando..." : "Adicionar Apartamento"}
        </button>
      </form>
    </div>
  );
}

