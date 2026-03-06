type SpecialBannerProps = {
  type: string;
  title: string;
  description: string | null;
  price: number | null;
  start_time: string | null;
  end_time: string | null;
};

export default function SpecialBanner({
  type,
  title,
  description,
  price,
  start_time,
  end_time,
}: SpecialBannerProps) {
  // Traducimos el tipo técnico a una etiqueta visible
  const labels: Record<string, string> = {
    plato_dia: "Plato del día",
    menu_semana: "Menú de la semana",
    vino_casa: "Vino de la casa",
  };

  return (
    <article className="special-banner">
      <p className="eyebrow">{labels[type] || type}</p>

      <h3 className="mt-3 text-2xl font-extrabold uppercase tracking-wide text-[#202020]">
        {title}
      </h3>

      {description && (
        <p className="mt-3 text-sm leading-6 text-[#4f4f4f]">
          {description}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-[#666666]">
          {start_time && end_time
            ? `${start_time} - ${end_time}`
            : "Disponible hoy"}
        </span>

        {price !== null && (
          <span className="text-xl font-extrabold text-[#202020]">
            €{Number(price).toFixed(2)}
          </span>
        )}
      </div>
    </article>
  );
}