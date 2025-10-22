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

  // Modal de detalhes do apartamento
  const DetalhesModal = ({ apartamento, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Detalhes do Apartamento</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Número</p>
            <p className="font-medium">{apartamento.numero}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Bloco</p>
            <p className="font-medium">{apartamento.bloco}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Proprietário</p>
            <p className="font-medium">{apartamento.proprietario}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Vencimento</p>
            <p className="font-medium">
              {new Date(apartamento.dueDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`inline-block px-2 py-1 rounded-full text-sm ${
                apartamento.status === "Pago"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {apartamento.status}
            </span>
          </div>

          {apartamento.history && (
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Histórico de Pagamentos
              </p>
              <div className="space-y-2">
                {apartamento.history.map((pagamento, index) => (
                  <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                    <p>Data: {new Date(pagamento.date).toLocaleDateString()}</p>
                    <p>Valor: R$ {pagamento.valor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                    <h3 className="font-medium">Apartamento {ap.numero}</h3>
                    <p className="text-sm text-gray-500">Bloco {ap.bloco}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ap.status === "Pago"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ap.status}
                  </span>
                </div>
                <p className="text-sm mt-2">{ap.proprietario}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Vencimento: {new Date(ap.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedAp && (
          <DetalhesModal
            apartamento={selectedAp}
            onClose={() => setSelectedAp(null)}
          />
        )}
      </main>
    </div>
  );
}
