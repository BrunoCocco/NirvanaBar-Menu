import "./globals.css";

// Metadata básica del proyecto.
// Esto sirve para el título que aparece en la pestaña del navegador
// y para la descripción general del sitio.
export const metadata = {
  title: "NIRVANA BAR MENU",
  description: "Carta digital de NIRVANA BAR",
};

// Este componente envuelve todas las páginas.
// children representa el contenido de cada ruta.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}