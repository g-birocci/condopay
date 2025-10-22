import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import NavBar from "@/components/NavBar";

// Importa o componente AddAp de forma dinâmica
const AddAp = dynamic(() => import("@/components/AddAp"), { ssr: false });

export default function Dashboard() {
  const [showAddAp, setShowAddAp] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard • CondoPay</title>
      </Head>

      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

          <div className="space-y-4 max-w-md">
            {/* Botão Adicionar Apartamento */}
            <button
              onClick={() => setShowAddAp(true)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <span className="mr-2">+</span>
              Adicionar Apartamento
            </button>

            {/* Botão Ver Apartamentos */}
            <button
              onClick={() => router.push("/apartamentos")}
              className="w-full px-4 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              <span className="mr-2">📋</span>
              Ver Apartamentos
            </button>
          </div>
        </div>

        {/* Modal de Adicionar Apartamento */}
        {showAddAp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="relative">
              <button
                onClick={() => setShowAddAp(false)}
                className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full border shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
              <AddAp onClose={() => setShowAddAp(false)} />
            </div>
          </div>
        )}

        {/* Aqui você pode adicionar cards de resumo, gráficos, etc */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium mb-2">Total de Apartamentos</h3>
            <p className="text-3xl font-semibold text-blue-600">0</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium mb-2">Pagamentos em Dia</h3>
            <p className="text-3xl font-semibold text-green-600">0</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium mb-2">Pagamentos em Atraso</h3>
            <p className="text-3xl font-semibold text-red-600">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
