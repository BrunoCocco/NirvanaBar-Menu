type MenuItemCardProps = {
  name: string;
  description: string | null;
  price: number;
  category: string;
};

export default function MenuItemCard({
  name,
  description,
  price,
  category,
}: MenuItemCardProps) {
  return (
    <article className="menu-card">
      <div className="flex items-start justify-between gap-4">
        {/* Bloque izquierdo */}
        <div className="flex-1">
          <h3 className="text-lg font-extrabold uppercase tracking-wide text-[#2a2a2a]">
            {name}
          </h3>

          <p className="mt-1 text-xs font-bold uppercase tracking-[0.28em] text-[#7b7b7b]">
            {category}
          </p>

          {description && (
            <p className="mt-2 text-sm leading-6 text-[#4f4f4f]">
              {description}
            </p>
          )}
        </div>

        {/* Bloque derecho */}
        <div className="shrink-0">
          <span className="menu-price">€{Number(price).toFixed(2)}</span>
        </div>
      </div>
    </article>
  );
}