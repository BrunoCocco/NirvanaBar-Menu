"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MenuItemCard from "@/components/MenuItemCard";
import SpecialBanner from "@/components/SpecialBanner";

// Tipo para los ítems del menú
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  available: boolean;
};

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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Idioma actual de la interfaz
  const [language, setLanguage] = useState<Language>("es");

  useEffect(() => {
    loadMenuData();
  }, []);

  async function loadMenuData() {
    setLoading(true);
    setErrorMessage("");

    try {
      const [menuResponse, specialsResponse] = await Promise.all([
        supabase
          .from("menu_items")
          .select("*")
          .eq("available", true)
          .order("category", { ascending: true })
          .order("name", { ascending: true }),

        supabase.from("specials").select("*"),
      ]);

      if (menuResponse.error) {
        console.error("Error en menu_items:", menuResponse.error);
        throw new Error(menuResponse.error.message);
      }

      if (specialsResponse.error) {
        console.error("Error en specials:", specialsResponse.error);
        throw new Error(specialsResponse.error.message);
      }

      setMenuItems((menuResponse.data as MenuItem[]) || []);
      setSpecials((specialsResponse.data as Special[]) || []);
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
      eyebrow: "Bar · Tapas · Son Veri Nou",
      digitalMenu: "Carta digital",
      intro:
        "Cocina casual con identidad propia, especiales del día y carta pensada para una lectura rápida desde QR.",
      exploreMenu: "Explorar carta",
      exploreSubtitle:
        "Elegí una sección para ver el menú completo en tu idioma.",
      currentMenu: "Menú actual",
      currentMenuTitle: "Nuestra carta",
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
      eyebrow: "Bar · Tapas · Son Veri Nou",
      digitalMenu: "Digital menu",
      intro:
        "Casual cuisine with its own identity, daily specials and a menu designed for quick QR reading.",
      exploreMenu: "Explore menu",
      exploreSubtitle:
        "Choose a section to view the full menu in your language.",
      currentMenu: "Current menu",
      currentMenuTitle: "Our menu",
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
      eyebrow: "Bar · Tapas · Son Veri Nou",
      digitalMenu: "Carte digitale",
      intro:
        "Cuisine décontractée avec sa propre identité, suggestions du jour et carte pensée pour une lecture rapide via QR.",
      exploreMenu: "Explorer la carte",
      exploreSubtitle:
        "Choisissez une section pour voir le menu complet dans votre langue.",
      currentMenu: "Menu actuel",
      currentMenuTitle: "Notre carte",
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
      eyebrow: "Bar · Tapas · Son Veri Nou",
      digitalMenu: "Digitale Speisekarte",
      intro:
        "Lockere Küche mit eigener Identität, Tagesangebote und eine Speisekarte für schnelles Lesen per QR.",
      exploreMenu: "Speisekarte entdecken",
      exploreSubtitle:
        "Wähle einen Bereich, um die vollständige Karte in deiner Sprache zu sehen.",
      currentMenu: "Aktuelle Karte",
      currentMenuTitle: "Unsere Karte",
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

  /*
  ========================================================
  AGRUPAR CARTA POR CATEGORÍA
  ========================================================
  */
  const groupedMenu = useMemo(() => {
    return menuItems.reduce((acc: Record<string, MenuItem[]>, item) => {
      const categoryName = item.category || "Sin categoría";

      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }

      acc[categoryName].push(item);
      return acc;
    }, {});
  }, [menuItems]);

  if (loading) {
    return (
      <main className="site-shell">
        <section className="site-container py-10">
          <div className="dark-panel p-8 text-center">
            <p className="brand-subtitle">NIRVANA</p>
            <h1 className="mt-4 text-2xl font-bold">Cargando carta...</h1>
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
            <h1 className="mt-4 text-2xl font-bold">Ups...</h1>
            <p className="mt-3 text-sm text-white/70">{errorMessage}</p>

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
      {/* HERO / CABECERA NUEVA */}
      <section className="site-container pt-8 pb-6 md:pt-12 md:pb-10">
        <div className="dark-panel overflow-hidden p-6 md:p-10">
          <div className="flex flex-col gap-8">
            {/* Barra superior con idiomas */}
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

            {/* Centro visual */}
            <div className="flex flex-col items-center text-center">
              <h1 className="brand-title">
                N<span className="text-[#d68a1f]">Y</span>RVANA
              </h1>
              <p className="brand-subtitle mt-4">{t.digitalMenu}</p>

              <div className="accent-line mt-6 w-full max-w-md" />

              <div className="mt-6 max-w-2xl">
                <p className="text-sm leading-7 text-white/80 md:text-base">
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

      {/* BOTONES / ACCESOS A SECCIONES */}
      <section className="site-container pb-8">
        <div className="paper-panel p-5 md:p-8">
          <div className="mb-8">
            <p className="eyebrow">{t.exploreMenu}</p>
            <h2 className="section-title mt-3">{t.exploreMenu}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4f4f4f]">
              {t.exploreSubtitle}
            </p>
            <div className="divider-dark mt-4" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {staticSections.map((section) => (
              <button
                key={section.slug}
                type="button"
                onClick={() =>
                  alert(
                    `Próximo paso: abrir sección "${section.slug}" en idioma "${language}".`
                  )
                }
                className="group rounded-[1.6rem] border border-black/10 bg-[#f8f1e7] p-5 text-left shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl">{section.emoji}</p>
                    <h3 className="mt-4 text-lg font-extrabold uppercase tracking-wide text-[#202020]">
                      {t.categories[section.slug]}
                    </h3>
                    <p className="mt-2 text-sm text-[#5a5a5a]">
                      {language.toUpperCase()}
                    </p>
                  </div>

                  <span className="text-xl text-[#d68a1f] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CARTA ACTUAL QUE YA TENÍAS */}
      <section className="site-container pb-12">
        <div className="paper-panel p-5 md:p-8">
          <div className="mb-8">
            <p className="eyebrow">{t.currentMenu}</p>
            <h2 className="section-title mt-3">{t.currentMenuTitle}</h2>
            <div className="divider-dark mt-4" />
          </div>

          <div className="space-y-10">
            {Object.keys(groupedMenu).map((categoryName) => (
              <section key={categoryName}>
                <h3 className="menu-category-title">{categoryName}</h3>

                <div>
                  {groupedMenu[categoryName].map((item) => (
                    <MenuItemCard
                      key={item.id}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      category={item.category}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* VINO ESPECIAL ABAJO */}
      {vinoCasa && (
        <section className="site-container pb-12">
          <SpecialBanner {...vinoCasa} />
        </section>
      )}

      <footer className="site-container pb-10">
        <div className="text-center text-xs uppercase tracking-[0.28em] text-white/45">
          NIRVANA · Son Veri Nou
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
          ? "border-[#d68a1f] bg-[#d68a1f] text-black"
          : "border-white/20 bg-white/5 text-white/75 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}