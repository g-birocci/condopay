export default function StatusBadge({ status }) {
  const cls =
    {
      Paid: "bg-green-100 text-green-700",
      Overdue: "bg-red-100 text-red-700",
      Pending: "bg-yellow-100 text-yellow-700",
    }[status] || "bg-gray-100 text-gray-700";

  return <span className={`px-2 py-1 text-xs rounded-full ${cls}`}>{status}</span>;
}
