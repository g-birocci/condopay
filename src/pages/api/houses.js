export default function handler(req, res) {
  // GET /api/houses
  if (req.method === "GET") {
    return res.status(200).json([
      { id: 1, name: "Casa 1", status: "Paid" },
      { id: 2, name: "Casa 2", status: "Overdue" },
      { id: 3, name: "Casa 3", status: "Paid" },
    ]);
  }
  return res.status(405).end();
}
