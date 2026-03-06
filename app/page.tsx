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
  updated_at?: string;
};

export default function HomePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

    console.log("menuResponse:", menuResponse);
    console.log("specialsResponse:", specialsResponse);

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

  const platoDia = specials.find((item) => item.type === "plato_dia");
  const menuSemana = specials.find((item) => item.type === "menu_semana");
  const vinoCasa = specials.find((item) => item.type === "vino_casa");

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
      <section className="site-container pt-8 pb-6 md:pt-12 md:pb-10">
        <div className="dark-panel overflow-hidden p-6 md:p-10">
          <div className="flex flex-col gap-6">
            <div>
              <p className="eyebrow">Bar · Tapas · Son Veri Nou</p>
              <h1 className="brand-title mt-3">
                N<span className="text-[#d68a1f]">Y</span>RVANA
              </h1>
              <p className="brand-subtitle mt-4">Carta digital</p>
            </div>

            <div className="accent-line" />

            <div className="max-w-2xl">
              <p className="text-sm leading-7 text-white/80 md:text-base">
                Cocina casual con identidad propia, especiales del día y carta
                pensada para una lectura rápida desde QR.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container pb-8">
        <div className="grid gap-4 md:grid-cols-2">
          {platoDia && <SpecialBanner {...platoDia} />}
          {menuSemana && <SpecialBanner {...menuSemana} />}
        </div>
      </section>

      <section className="site-container pb-12">
        <div className="paper-panel p-5 md:p-8">
          <div className="mb-8">
            <p className="eyebrow">Menú</p>
            <h2 className="section-title mt-3">Nuestra carta</h2>
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