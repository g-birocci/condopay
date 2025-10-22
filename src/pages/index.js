import dynamic from "next/dynamic";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

// Importa o componente Login de forma dinâmica (client-side)
const Login = dynamic(() => import("@/components/Login"), { ssr: false });

// Fontes Google (Geist)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen items-center justify-center bg-zinc-50 font-sans`}
    >
      <Login />
    </div>
  );
}
