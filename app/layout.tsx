import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { obtenerUsuario } from "../lib/auth";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mi Poemario",
  description: "Tu colección de versos íntimos",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const usuario = await obtenerUsuario();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar usuario={usuario} />
        {children}
        <footer className="text-center text-sm text-slate-500 mt-8 py-6">
          <p>© {new Date().getFullYear()} Codexia. Todos los derechos reservados.</p>
          <p>Desarrollado para Mi Poemario con tecnología Next.js y MySQL.</p>
        </footer>
      </body>
    </html>
  );
}
