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
  image_url: string | null;
  is_visible: boolean;
  updated_at?: string;
};

// Tipo auxiliar para guardar archivos seleccionados en memoria,
// usando como clave el id del special.
type PendingImageMap = Record<number, File | null>;

export default function DashboardPage() {
  const router = useRouter();

  // Estado principal con los specials cargados desde la base
  const [specials, setSpecials] = useState<Special[]>([]);

  // Estado de carga general de la página
  const [loading, setLoading] = useState(true);

  // Estado para mostrar errores generales
  const [errorMessage, setErrorMessage] = useState("");

  // Estado para guardar imágenes elegidas pero todavía no subidas
  const [pendingImages, setPendingImages] = useState<PendingImageMap>({});

  // useEffect corre una vez al montar el componente
  useEffect(() => {
    checkSessionAndLoadData();
  }, []);

  // Etiquetas visibles para no mostrar el type técnico crudo al usuario
  const specialLabels: Record<string, string> = {
    plato_dia: "Plato del día",
    menu_semana: "Menú de la semana",
    vino_casa: "Vino del mes",
    promocion_1: "Promoción 1",
    promocion_2: "Promoción 2",
    promocion_3: "Promoción 3",
    ensaladas_casa: "Ensaladas de la casa",
  };

  // Orden visual fijo del dashboard
  const specialOrder = [
    "plato_dia",
    "menu_semana",
    "vino_casa",
    "promocion_1",
    "promocion_2",
    "promocion_3",
    "ensaladas_casa",
  ];

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

      // Ordenamos visualmente según el orden que definimos arriba
      const sortedSpecials = ((data as Special[]) || []).sort((a, b) => {
        return specialOrder.indexOf(a.type) - specialOrder.indexOf(b.type);
      });

      setSpecials(sortedSpecials);
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

  // Esta función actualiza el estado local cuando el usuario escribe o cambia un valor
  function handleChange(
    index: number,
    field: keyof Special,
    value: string | number | boolean | null
  ) {
    const updatedSpecials = [...specials];

    // Actualizamos solo el campo que cambió dentro del special correcto
    updatedSpecials[index] = {
      ...updatedSpecials[index],
      [field]: value,
    };

    setSpecials(updatedSpecials);
  }

  // Guardamos en memoria el archivo elegido por el usuario, pero todavía no lo subimos
  function handleImageSelection(specialId: number, file: File | null) {
    setPendingImages((prev) => ({
      ...prev,
      [specialId]: file,
    }));
  }

  // Esta función sube una imagen al bucket "specials-images"
  async function uploadSpecialImage(file: File, specialType: string) {
    // Sacamos la extensión del archivo original
    const fileExtension = file.name.split(".").pop() || "jpg";

    // Creamos un nombre único para evitar choques
    const fileName = `${specialType}-${Date.now()}.${fileExtension}`;

    // Organizamos por carpeta según el tipo de special
    const filePath = `${specialType}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("specials-images")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Obtenemos la URL pública del archivo ya subido
    const { data } = supabase.storage
      .from("specials-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Guarda un solo special en la base
  async function saveSpecial(item: Special) {
    try {
      let finalImageUrl = item.image_url;

      // Si hay una imagen nueva seleccionada para este special, la subimos primero
      const selectedImage = pendingImages[item.id];

      if (selectedImage) {
        finalImageUrl = await uploadSpecialImage(selectedImage, item.type);
      }

      const { error } = await supabase
        .from("specials")
        .update({
          title: item.title || "",
          description: item.description || null,
          price:
            item.price === null || item.price === undefined || item.price === 0
              ? null
              : Number(item.price),
          start_time: item.start_time || null,
          end_time: item.end_time || null,
          image_url: finalImageUrl,
          is_visible: item.is_visible,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) {
        throw new Error(error.message);
      }

      // Limpiamos la imagen pendiente de ese special si se guardó bien
      setPendingImages((prev) => ({
        ...prev,
        [item.id]: null,
      }));

      alert("Cambios guardados correctamente");
      await checkSessionAndLoadData();
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
          {specials.map((item, index) => {
            const previewUrl = pendingImages[item.id]
              ? URL.createObjectURL(pendingImages[item.id] as File)
              : item.image_url;

            return (
              <article key={item.id} className="paper-panel p-6 md:p-8">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="eyebrow">{item.type}</p>
                    <h2 className="section-title mt-3">
                      {specialLabels[item.type] || "Editar special"}
                    </h2>
                    <div className="divider-dark mt-4" />
                  </div>

                  <label className="flex items-center gap-3 text-sm font-semibold text-[#2c2c2c]">
                    <input
                      type="checkbox"
                      checked={item.is_visible}
                      onChange={(event) =>
                        handleChange(index, "is_visible", event.target.checked)
                      }
                    />
                    Visible en el front
                  </label>
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
                        handleChange(
                          index,
                          "description",
                          event.target.value || null
                        )
                      }
                      className="textarea-base"
                      placeholder="Opcional. Si lo dejás vacío, no se mostrará."
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
                        handleChange(
                          index,
                          "price",
                          event.target.value === ""
                            ? null
                            : Number(event.target.value)
                        )
                      }
                      className="input-base"
                      placeholder="Opcional"
                    />
                  </div>

                  {/* Horarios */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2c2c2c]">
                        Hora inicio
                      </label>
                      <input
                        type="time"
                        value={item.start_time || ""}
                        onChange={(event) =>
                          handleChange(
                            index,
                            "start_time",
                            event.target.value || null
                          )
                        }
                        className="input-base"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#2c2c2c]">
                        Hora fin
                      </label>
                      <input
                        type="time"
                        value={item.end_time || ""}
                        onChange={(event) =>
                          handleChange(
                            index,
                            "end_time",
                            event.target.value || null
                          )
                        }
                        className="input-base"
                      />
                    </div>
                  </div>

                  {/* Imagen */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2c2c2c]">
                      Imagen del special
                    </label>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) =>
                        handleImageSelection(
                          item.id,
                          event.target.files?.[0] || null
                        )
                      }
                      className="input-base file:mr-4 file:rounded-md file:border-0 file:bg-[#d68a1f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
                    />

                    <p className="mt-2 text-xs text-[#5f5f5f]">
                      La imagen se adapta al ancho de pantalla. Recomendación:
                      usar imágenes pensadas para móvil.
                    </p>

                    {previewUrl && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-black/10">
                        <img
                          src={previewUrl}
                          alt={item.title || "Preview del special"}
                          className="h-64 w-full object-cover"
                        />
                      </div>
                    )}
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
            );
          })}
        </div>
      </section>
    </main>
  );
}