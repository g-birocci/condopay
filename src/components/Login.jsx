import Image from "next/image";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const go = () => router.push("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border shadow-sm rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-3">
          <Image src="/logo.png" alt="CondoPay Logo" width={42} height={42} priority />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-6">CondoPay</h1>

        <label className="text-sm">E-mail</label>
        <input className="w-full border rounded-xl px-3 py-2 mt-1 mb-3" placeholder="bytes@info.com" />

        <label className="text-sm">Password</label>
        <input type="password" className="w-full border rounded-xl px-3 py-2 mt-1 mb-4" placeholder="••••••••" />

        <button onClick={go} className="w-full rounded-xl bg-blue-600 text-white py-2 hover:bg-blue-700 transition">
          Log In
        </button>

        <button className="block mx-auto mt-3 text-xs text-gray-500 hover:underline">Forgot password?</button>
      </div>
    </div>
  );
}

