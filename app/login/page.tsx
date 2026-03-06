"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  // Router de Next para navegar después del login
  const router = useRouter();

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estado para mostrar errores al usuario
  const [errorMessage, setErrorMessage] = useState("");

  // Estado para bloquear el botón mientras se envía
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      // Le pedimos a Supabase que inicie sesión
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Si Supabase devuelve error, lo mostramos
      if (error) {
        throw new Error(error.message);
      }

      // Si todo sale bien, mandamos al dashboard
      router.push("/dashboard");
    } catch (error) {
      // Mostramos un mensaje claro
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("No se pudo iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="site-shell flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="dark-panel p-6 md:p-8">
          {/* Encabezado */}
          <div className="mb-6 text-center">
            <p className="eyebrow">Admin Access</p>
            <h1 className="brand-title mt-3 text-[2.4rem] md:text-[3rem]">
              N<span className="text-[#d68a1f]">Y</span>RVANA
            </h1>
            <p className="brand-subtitle mt-3">Panel de acceso</p>
          </div>

          <div className="accent-line mx-auto mb-6" />

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">
                Email
              </label>
              <input
                type="email"
                placeholder="admin@nirvana.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input-base"
                required
              />
            </div>

            {/* Mensaje de error */}
            {errorMessage && (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar al dashboard"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}