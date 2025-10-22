import Head from "next/head";
import StatusBadge from "@/components/StatusBadge";
import { getHouses } from "@/services/houses";

export default function HousesPage() {
  const houses = getHouses();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Head>
        <title>Houses • CondoPay</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Houses</h1>
          <a href="/" className="text-sm text-blue-600 hover:underline">Sair</a>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3">Proprietário</th>
                <th className="text-left px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {houses.map((h) => (
                <tr key={h.id} className="border-t">
                  <td className="px-4 py-3">{h.name}</td>
                  <td className="px-4 py-3 text-gray-700">{h.owner}</td>
                  <td className="px-4 py-3"><StatusBadge status={h.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

