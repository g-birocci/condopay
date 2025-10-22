// GET /api/produtos
//GET /api/produto/:id
//Temos que fazer os get separados
//POST /api/produtos
//PUT /api/produtos/:id
//DELETE /api/produtos/:id

// Login 
export default function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    if (username === "admin" && password === "1234") {
      return res.status(200).json({ success: true, message: "Login realizado com sucesso!" });
    } else {
      return res.status(401).json({ success: false, message: "Credenciais inválidas." });
    }
  } else {
    return res.status(405).json({ message: "Método não permitido" });
  }
}
