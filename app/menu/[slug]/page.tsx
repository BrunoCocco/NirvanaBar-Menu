"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Language = "es" | "en" | "fr" | "de";

type MenuSection = {
  id: number;
  slug: string;
  title_es: string;
  title_en: string | null;
  title_fr: string | null;
  title_de: string | null;
  pdf_es_url: string | null;
  pdf_en_url: string | null;
  pdf_fr_url: string | null;
  pdf_de_url: string | null;
  is_visible: boolean;
  display_order: number;
  updated_at: string;
};

export default function MenuSectionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const requestedLanguage = (searchParams.get("lang") as Language) || "es";

  const [menuSection, setMenuSection] = useState<MenuSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadMenuSection();
  }, [slug]);

  async function loadMenuSection() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("menu_sections")
        .select("*")
        .eq("slug", slug)
        .eq("is_visible", true)
        .single();

      if (error) {
        console.error("Error en menu_sections:", error);
        throw new Error(error.message);
      }

      setMenuSection(data as MenuSection);
    } catch (error) {
      console.error("Error cargando sección:", error);
      setErrorMessage("No se pudo cargar esta sección del menú.");
    } finally {
      setLoading(false);
    }
  }

  /*
  ========================================================
  FALLBACK DE PDF POR IDIOMA
  ========================================================

  Orden pedido:
  1. español
  2. inglés
  3. alemán
  4. francés

  Primero intentamos el idioma actual si existe.
  Si no existe, aplicamos el fallback definido.
  */
  const resolvedContent = useMemo(() => {
    if (!menuSection) return { title: "", pdfUrl: "" };

    const titleMap = {
      es: menuSection.title_es,
      en: menuSection.title_en,
      fr: menuSection.title_fr,
      de: menuSection.title_de,
    };

    const pdfMap = {
      es: menuSection.pdf_es_url,
      en: menuSection.pdf_en_url,
      fr: menuSection.pdf_fr_url,
      de: menuSection.pdf_de_url,
    };

    const fallbackOrder: Language[] = ["es", "en", "de", "fr"];

    const candidateOrder: Language[] = [
      requestedLanguage,
      ...fallbackOrder.filter((item) => item !== requestedLanguage),
    ];

    const resolvedLanguage =
      candidateOrder.find((item) => pdfMap[item]) || "es";

    return {
      title: titleMap[resolvedLanguage] || menuSection.title_es,
      pdfUrl: pdfMap[resolvedLanguage] || menuSection.pdf_es_url || "",
    };
  }, [menuSection, requestedLanguage]);

  if (loading) {
    return (
      <main className="site-shell">
        <section className="site-container py-10">
          <div className="dark-panel p-8 text-center">
            <p className="brand-subtitle">NIRVANA</p>
            <h1 className="mt-4 text-2xl font-bold text-[var(--accent)]">
              Cargando sección...
            </h1>
          </div>
        </section>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="site-shell">
        <section className="site-container py-10">
          <div className="dark-panel p-8 text-center">
            <p className="brand-subtitle">NIRVANA</p>
            <h1 className="mt-4 text-2xl font-bold text-[var(--accent)]">
              Ups...
            </h1>
            <p className="mt-3 text-sm text-[var(--text-dark-soft)]">
              {errorMessage}
            </p>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="btn-primary"
              >
                Volver a la carta
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!resolvedContent.pdfUrl) {
    return (
      <main className="site-shell">
        <section className="site-container py-10">
          <div className="dark-panel p-8 text-center">
            <p className="brand-subtitle">NIRVANA</p>
            <h1 className="mt-4 text-2xl font-bold text-[var(--accent)]">
              Sección no disponible
            </h1>
            <p className="mt-3 text-sm text-[var(--text-dark-soft)]">
              Esta sección todavía no tiene un PDF disponible.
            </p>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="btn-primary"
              >
                Volver a la carta
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="site-shell">
      <section className="site-container pt-8 pb-6 md:pt-12">
        <div className="dark-panel p-5 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">NIRVANA · Son Veri Nou</p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-[var(--accent)] md:text-4xl">
                {resolvedContent.title}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn-primary"
            >
              Volver
            </button>
          </div>
        </div>
      </section>

      <section className="site-container pb-12">
        <div className="overflow-hidden rounded-[1.5rem] border border-[var(--line-dark)] bg-[var(--paper)] shadow-sm">
          <iframe
            src={resolvedContent.pdfUrl}
            title={resolvedContent.title}
            className="h-[78vh] w-full"
          />
        </div>
      </section>
    </main>
  );
}