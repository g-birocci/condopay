import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const go = () => router.push("/houses");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-md bg-blue-600" />
          <h1 className="text-xl font-semibold">CondoPay</h1>
        </div>

        <label className="text-sm">E-mail</label>
        <input className="w-full border rounded-xl px-3 py-2 mt-1 mb-3" placeholder="you@email.com" />

        <label className="text-sm">Password</label>
        <input type="password" className="w-full border rounded-xl px-3 py-2 mt-1 mb-4" placeholder="••••••••" />

        <button onClick={go} className="w-full rounded-xl bg-blue-600 text-white py-2">
          Log In
        </button>

        <button className="block mx-auto mt-3 text-xs text-gray-500 hover:underline">Forgot password?</button>
      </div>
    </div>
  );
}
