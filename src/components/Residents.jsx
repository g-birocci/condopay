import { useMemo } from "react";
import { useRouter } from "next/router";

const STATUS_STYLES = {
  Paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Overdue: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export default function Residents({ data }) {
  const router = useRouter();

  // dados iguais ao print se nada vier por props
  const rows = useMemo(
    () =>
      Array.isArray(data) && data.length
        ? data
        : [
            { id: 1, name: "Sandra Silva", status: "Paid" },
            { id: 2, name: "João Ferreira", status: "Overdue" },
            { id: 3, name: "Inês Martins", status: "Paid" },
            { id: 4, name: "André Costa", status: "Overdue" },
            { id: 5, name: "Cláudia Rocha", status: "Paid" },
            { id: 6, name: "Pedro Sousa", status: "Paid" },
          ],
    [data]
  );

  const goTo = (id) => router.push(`/houses/${id}`);

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header da tabela */}
      <div className="px-4 pt-4">
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-500">
                <th className="w-3/5 px-4 py-3 font-medium">Unit</th>
                <th className="w-2/5 px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => goTo(r.id)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && goTo(r.id)
                  }
                  role="button"
                  tabIndex={0}
                  className="hover:bg-gray-50/60 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  title={`Abrir ${r.name}`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{r.name}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Espaço inferior para manter o mesmo respiro do print */}
      <div className="pb-4" />
    </section>
  );
}
