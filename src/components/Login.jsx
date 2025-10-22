import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import API from "@/services/api";

export default function Login() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      if (user === "admin" && pass === "1234") {
        localStorage.setItem("role", "admin");
        return router.push("/dashboard");
      }
      if (user === "user" && pass === "1234") {
        localStorage.setItem("role", "user");
        // Vincula um apartamento para o demo: pega o primeiro
        try {
          const { data } = await API.get("/apartamentos");
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem("userApId", data[0]._id);
            localStorage.setItem("userApNumero", data[0].numeroAp || "");
          }
        } catch {}
        return router.push("/user/boletos");
      }
      setError("Credenciais inválidas. Use admin/1234 ou user/1234.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border shadow-sm rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-3">
          <Image src="/logo.png" alt="CondoPay Logo" width={42} height={42} priority />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-6">CondoPay</h1>

        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>
        )}

        <label className="text-sm">Usuário</label>
        <input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full border rounded-xl px-3 py-2 mt-1 mb-3"
          placeholder="admin ou user"
        />

        <label className="text-sm">Senha</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full border rounded-xl px-3 py-2 mt-1 mb-4"
          placeholder="1234"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 text-white py-2 hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-3 text-xs text-gray-500">Demo: admin/1234 ou user/1234</p>
      </div>
    </div>
  );
}

