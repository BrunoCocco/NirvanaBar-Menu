"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SpecialBanner from "@/components/SpecialBanner";

// Tipo para los specials
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

// Idiomas soportados en esta fase
type Language = "es" | "en" | "fr" | "de";

export default function HomePage() {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Idioma actual de la interfaz
  const [language, setLanguage] = useState<Language>("es");

  const router = useRouter();

  useEffect(() => {
    loadMenuData();
  }, []);

  async function loadMenuData() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.from("specials").select("*");

      if (error) {
        console.error("Error en specials:", error);
        throw new Error(error.message);
      }

      setSpecials((data as Special[]) || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setErrorMessage("No se pudo cargar la carta en este momento.");
    } finally {
      setLoading(false);
    }
  }

  /*
  ========================================================
  TRADUCCIONES DE INTERFAZ
  ========================================================

  Esto es solo para textos fijos de la interfaz.
  Más adelante, el idioma también servirá para elegir PDFs.
  */
  const translations = {
    es: {
      eyebrow: "Son Veri Nou",
      digitalMenu: "Carta digital",
      intro:
        "Cocina casual con identidad propia, especiales del día y carta pensada para una lectura rápida desde QR.",
      exploreMenu: "Explorar carta",
      exploreSubtitle:
        "Elegí una sección para ver el menú completo en tu idioma.",
      categories: {
        carta: "Carta",
        tostadas_bocadillos: "Tostadas / Bocadillos",
        cocktail: "Cocktail",
        cervezas: "Cervezas",
        carta_vinos: "Carta de vinos",
        cafeteria: "Cafetería",
      },
    },
    en: {
      eyebrow: "Son Veri Nou",
      digitalMenu: "Digital menu",
      intro:
        "Casual cuisine with its own identity, daily specials and a menu designed for quick QR reading.",
      exploreMenu: "Explore menu",
      exploreSubtitle:
        "Choose a section to view the full menu in your language.",
      categories: {
        carta: "Menu",
        tostadas_bocadillos: "Toasts / Sandwiches",
        cocktail: "Cocktails",
        cervezas: "Beers",
        carta_vinos: "Wine list",
        cafeteria: "Coffee",
      },
    },
    fr: {
      eyebrow: "Son Veri Nou",
      digitalMenu: "Carte digitale",
      intro:
        "Cuisine décontractée avec sa propre identité, suggestions du jour et carte pensée pour une lecture rapide via QR.",
      exploreMenu: "Explorer la carte",
      exploreSubtitle:
        "Choisissez une section pour voir le menu complet dans votre langue.",
      categories: {
        carta: "Carte",
        tostadas_bocadillos: "Toasts / Sandwichs",
        cocktail: "Cocktails",
        cervezas: "Bières",
        carta_vinos: "Carte des vins",
        cafeteria: "Café",
      },
    },
    de: {
      eyebrow: "Son Veri Nou",
      digitalMenu: "Digitale Speisekarte",
      intro:
        "Lockere Küche mit eigener Identität, Tagesangebote und eine Speisekarte für schnelles Lesen per QR.",
      exploreMenu: "Speisekarte entdecken",
      exploreSubtitle:
        "Wähle einen Bereich, um die vollständige Karte in deiner Sprache zu sehen.",
      categories: {
        carta: "Speisekarte",
        tostadas_bocadillos: "Toast / Bocadillos",
        cocktail: "Cocktails",
        cervezas: "Biere",
        carta_vinos: "Weinkarte",
        cafeteria: "Café",
      },
    },
  } as const;

  const t = translations[language];

  /*
  ========================================================
  SECCIONES FIJAS DEL MENÚ
  ========================================================

  Por ahora las declaramos acá para construir la UI.
  Más adelante las conectaremos con menu_sections + PDF real.
  */
  const staticSections = [
    { slug: "carta", emoji: "🍽️" },
    { slug: "tostadas_bocadillos", emoji: "🥪" },
    { slug: "cocktail", emoji: "🍸" },
    { slug: "cervezas", emoji: "🍺" },
    { slug: "carta_vinos", emoji: "🍷" },
    { slug: "cafeteria", emoji: "☕" },
  ] as const;

  /*
  ========================================================
  MAPEO ENTRE UI Y SLUG REAL DE BASE
  ========================================================

  Mantenemos los nombres visuales actuales para no romper
  translations, pero resolvemos el slug técnico real cuando
  una sección ya existe en public.menu_sections.
  */
  const sectionSlugMap: Record<string, string> = {
    carta_vinos: "wine-list",
  };

  /*
  ========================================================
  SPECIALS INDIVIDUALES MANTENIDOS
  ========================================================
  */

  const platoDia = specials.find(
    (item) => item.type === "plato_dia" && item.is_visible
  );

  const menuSemana = specials.find(
    (item) => item.type === "menu_semana" && item.is_visible
  );

  const vinoCasa = specials.find(
    (item) => item.type === "vino_casa" && item.is_visible
  );

  const promocion1 = specials.find(
    (item) => item.type === "promocion_1" && item.is_visible
  );

  const promocion2 = specials.find(
    (item) => item.type === "promocion_2" && item.is_visible
  );

  const promocion3 = specials.find(
    (item) => item.type === "promocion_3" && item.is_visible
  );

  const ensaladasCasa = specials.find(
    (item) => item.type === "ensaladas_casa" && item.is_visible
  );

  const topSpecials = [
    platoDia,
    menuSemana,
    promocion1,
    promocion2,
    promocion3,
    ensaladasCasa,
  ].filter(Boolean) as Special[];

  if (loading) {
    return (
      <main className="site-shell">
        <section className="site-container py-10">
          <div className="dark-panel p-8 text-center">
            <p className="brand-subtitle">NIRVANA</p>
            <h1 className="mt-4 text-2xl font-bold text-[var(--accent)]">
              Cargando carta...
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

            <button onClick={loadMenuData} className="btn-primary mt-6">
              Reintentar
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="site-shell">
      {/* HERO / CABECERA PRINCIPAL */}
      <section className="site-container pt-8 pb-6 md:pt-12 md:pb-10">
        <div className="dark-panel overflow-hidden p-6 md:p-10">
          <div className="flex flex-col gap-8">
            {/* Barra superior con ubicación e idiomas */}
            <div className="flex items-start justify-between gap-4">
              <div className="text-left">
                <p className="eyebrow">{t.eyebrow}</p>
              </div>

              <div className="flex items-center gap-2">
                <LanguageButton
                  label="ES"
                  active={language === "es"}
                  onClick={() => setLanguage("es")}
                />
                <LanguageButton
                  label="EN"
                  active={language === "en"}
                  onClick={() => setLanguage("en")}
                />
                <LanguageButton
                  label="FR"
                  active={language === "fr"}
                  onClick={() => setLanguage("fr")}
                />
                <LanguageButton
                  label="DE"
                  active={language === "de"}
                  onClick={() => setLanguage("de")}
                />
              </div>
            </div>

            {/* Centro visual de marca */}
            <div className="flex flex-col items-center text-center">
              <h1 className="brand-title">
                N<span className="text-[var(--accent)]">Y</span>RVANA
              </h1>

              <p className="brand-subtitle mt-4">{t.digitalMenu}</p>

              <div className="accent-line mt-6 w-full max-w-md" />

              <div className="mt-6 max-w-2xl">
                <p className="text-sm leading-7 text-[var(--text-dark-soft)] md:text-base">
                  {t.intro}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALS SUPERIORES */}
      {topSpecials.length > 0 && (
        <section className="site-container pb-8">
          <div className="grid gap-4 md:grid-cols-2">
            {topSpecials.map((item) => (
              <SpecialBanner key={item.id} {...item} />
            ))}
          </div>
        </section>
      )}

      {/* ACCESOS A SECCIONES DEL MENÚ */}
      <section className="site-container pb-12">
        {/* Encabezado de la sección fuera de panel crema */}
        <div className="mb-8 px-2 text-center md:px-0 md:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
            {t.exploreMenu}
          </p>

          <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-[var(--accent)] md:text-4xl">
            {t.exploreMenu}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-dark-soft)] md:text-left md:text-base">
            {t.exploreSubtitle}
          </p>
        </div>

        {/* Grilla de accesos compacta, pensada para móvil */}
        <div className="grid gap-3 px-2 sm:grid-cols-2 sm:gap-4 sm:px-0 xl:grid-cols-3">
          {staticSections.map((section) => {
            const resolvedSlug = sectionSlugMap[section.slug] || section.slug;

            return (
              <button
                key={section.slug}
                type="button"
                onClick={() => router.push(`/menu/${resolvedSlug}?lang=${language}`)}
                className="group rounded-[1.35rem] border border-[var(--line-dark)] bg-[var(--paper)] px-4 py-3 text-left shadow-sm transition duration-200 hover:-translate-y-[1px] hover:shadow-md sm:rounded-[1.55rem] sm:px-5 sm:py-4"
              >
                {/* Contenido horizontal, sin flecha, más limpio */}
                <div className="flex items-center justify-start gap-3 sm:gap-4">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="text-xl sm:text-2xl">{section.emoji}</span>

                    <h3 className="text-[0.95rem] font-extrabold uppercase tracking-[0.06em] text-[var(--text-dark)] sm:text-base md:text-lg">
                      {t.categories[section.slug]}
                    </h3>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* VINO ESPECIAL ABAJO */}
      {vinoCasa && (
        <section className="site-container pb-12">
          <SpecialBanner {...vinoCasa} />
        </section>
      )}

      {/* FOOTER */}
      <footer className="site-container pb-10">
        <div className="text-center text-xs uppercase tracking-[0.28em]">
          <span className="text-[var(--accent)]">NIRVANA</span>
          <span className="text-[var(--text-dark-soft)]"> · Son Veri Nou</span>
        </div>
      </footer>
    </main>
  );
}

/*
========================================================
BOTÓN DE IDIOMA
========================================================
*/
function LanguageButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] transition ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
          : "border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)]/10"
      }`}
    >
      {label}
    </button>
  );
}