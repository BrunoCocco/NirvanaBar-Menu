"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Tipo para los specials que vienen de Supabase
type Special = {
  id: number;
  type: string;
  title: string;
  description: string | null;
  price: number | null;
  start_time: string | null;
  end_time: string | null;
  updated_at?: string;
};

export default function DashboardPage() {
  const router = useRouter();

  // Estado principal con los specials cargados desde la base
  const [specials, setSpecials] = useState<Special[]>([]);

  // Estado de carga general de la página
  const [loading, setLoading] = useState(true);

  // Estado para mostrar errores generales
  const [errorMessage, setErrorMessage] = useState("");

  // useEffect corre una vez al montar el componente
  useEffect(() => {
    checkSessionAndLoadData();
  }, []);

  // Esta función valida sesión y luego carga specials
  async function checkSessionAndLoadData() {
    setLoading(true);
    setErrorMessage("");

    try {
      // Le preguntamos a Supabase si existe sesión activa
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      // Si no hay sesión, mandamos al login
      if (!session) {
        router.push("/login");
        return;
      }

      // Si hay sesión, traemos los specials
      const { data, error } = await supabase
        .from("specials")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      setSpecials((data as Special[]) || []);
    } catch (error) {
      console.error("Error cargando dashboard:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("No se pudo cargar el dashboard.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Esta función actualiza el estado local cuando el usuario escribe
  function handleChange(
    index: number,
    field: keyof Special,
    value: string
  ) {
    const updatedSpecials = [...specials];

    // Actualizamos solo el campo que cambió dentro del special correcto
    updatedSpecials[index] = {
      ...updatedSpecials[index],
      [field]: value,
    };

    setSpecials(updatedSpecials);
  }

  // Guarda un solo special en la base
  async function saveSpecial(item: Special) {
    try {
      const { error } = await supabase
        .from("specials")
        .update({
          title: item.title,
          description: item.description,
          price: item.price ? Number(item.price) : null,
          start_time: item.start_time,
          end_time: item.end_time,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) {
        throw new Error(error.message);
      }

      alert("Cambios guardados correctamente");
    } catch (error) {
      console.error("Error guardando special:", error);

      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("No se pudo guardar el special.");
      }
    }
  }

  // Cierra la sesión actual y vuelve al login
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Vista de carga
  if (loading) {
    return (
      <main className="site-shell">
        <section className="site-container py-10">
          <div className="dark-panel p-8 text-center">
            <p className="brand-subtitle">NIRVANA</p>
            <h1 className="mt-4 text-2xl font-bold">Cargando dashboard...</h1>
          </div>
        </section>
      </main>
    );
  }

  // Vista de error
  if (errorMessage) {
    return (
      <main className="site-shell">
        <section className="site-container py-10">
          <div className="dark-panel p-8 text-center">
            <p className="brand-subtitle">NIRVANA</p>
            <h1 className="mt-4 text-2xl font-bold">Ups...</h1>
            <p className="mt-3 text-sm text-white/70">{errorMessage}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="site-shell">
      <section className="site-container py-8 md:py-10">
        {/* Cabecera del panel */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="brand-title mt-3 text-[2.4rem] md:text-[3.2rem]">
              N<span className="text-[#d68a1f]">Y</span>RVANA
            </h1>
            <p className="brand-subtitle mt-3">Gestión de specials</p>
          </div>

          <button onClick={handleLogout} className="btn-primary">
            Cerrar sesión
          </button>
        </div>

        {/* Lista de specials editables */}
        <div className="grid gap-6">
          {specials.map((item, index) => (
            <article key={item.id} className="paper-panel p-6 md:p-8">
              <div className="mb-6">
                <p className="eyebrow">{item.type}</p>
                <h2 className="section-title mt-3">
                  Editar special
                </h2>
                <div className="divider-dark mt-4" />
              </div>

              <div className="grid gap-4">
                {/* Título */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2c2c2c]">
                    Título
                  </label>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(event) =>
                      handleChange(index, "title", event.target.value)
                    }
                    className="input-base"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2c2c2c]">
                    Descripción
                  </label>
                  <textarea
                    value={item.description || ""}
                    onChange={(event) =>
                      handleChange(index, "description", event.target.value)
                    }
                    className="textarea-base"
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2c2c2c]">
                    Precio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.price ?? ""}
                    onChange={(event) =>
                      handleChange(index, "price", event.target.value)
                    }
                    className="input-base"
                  />
                </div>

                {/* Horarios */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2c2c2c]">
                      Hora inicio
                    </label>
                    <input
                      type="text"
                      value={item.start_time || ""}
                      onChange={(event) =>
                        handleChange(index, "start_time", event.target.value)
                      }
                      className="input-base"
                      placeholder="13:00"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2c2c2c]">
                      Hora fin
                    </label>
                    <input
                      type="text"
                      value={item.end_time || ""}
                      onChange={(event) =>
                        handleChange(index, "end_time", event.target.value)
                      }
                      className="input-base"
                      placeholder="16:00"
                    />
                  </div>
                </div>

                {/* Botón guardar */}
                <div className="pt-2">
                  <button
                    onClick={() => saveSpecial(item)}
                    className="btn-primary"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}