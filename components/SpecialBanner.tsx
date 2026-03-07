type SpecialBannerProps = {
  type: string;
  title: string;
  description: string | null;
  price: number | null;
  start_time: string | null;
  end_time: string | null;
  image_url?: string | null;
  is_visible?: boolean;
};

export default function SpecialBanner({
  type,
  title,
  description,
  price,
  start_time,
  end_time,
  image_url,
}: SpecialBannerProps) {
  // Traducimos el tipo técnico a una etiqueta visible
  const labels: Record<string, string> = {
    plato_dia: "Plato del día",
    menu_semana: "Menú de la semana",
    vino_casa: "Vino del mes",
    promocion_1: "Promoción 1",
    promocion_2: "Promoción 2",
    promocion_3: "Promoción 3",
    ensaladas_casa: "Ensaladas de la casa",
  };

  // Determinamos si realmente hay horario para mostrar
  const hasSchedule = Boolean(start_time && end_time);

  // Determinamos si realmente hay precio para mostrar
  const hasPrice = price !== null && price !== undefined;

  // Determinamos si realmente hay descripción para mostrar
  const hasDescription = Boolean(description && description.trim() !== "");

  // Determinamos si realmente hay título para mostrar
  const hasTitle = Boolean(title && title.trim() !== "");

  return (
    <article className="special-banner overflow-hidden">
      {/* Si existe imagen, la mostramos arriba */}
      {image_url && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-black/10">
          <img
            src={image_url}
            alt={hasTitle ? title : labels[type] || "Special"}
            className="h-64 w-full object-cover"
          />
        </div>
      )}

      <p className="eyebrow">{labels[type] || type}</p>

      {/* Solo renderizamos el título si existe */}
      {hasTitle && (
        <h3 className="mt-3 text-2xl font-extrabold uppercase tracking-wide text-[#202020]">
          {title}
        </h3>
      )}

      {/* Solo renderizamos descripción si existe */}
      {hasDescription && (
        <p className="mt-3 text-sm leading-6 text-[#4f4f4f]">
          {description}
        </p>
      )}

      {/* Esta fila solo aparece si existe horario o precio */}
      {(hasSchedule || hasPrice) && (
        <div className="mt-5 flex items-center justify-between gap-4">
          {hasSchedule ? (
            <span className="text-sm font-semibold text-[#666666]">
              {start_time} - {end_time}
            </span>
          ) : (
            <span />
          )}

          {hasPrice && (
            <span className="text-xl font-extrabold text-[#202020]">
              €{Number(price).toFixed(2)}
            </span>
          )}
        </div>
      )}
    </article>
  );
}