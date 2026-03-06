MANUAL INTERNO DE USO — NIRVANA BAR MENU

RESUMEN GENERAL DE LO CONSTRUIDO

Hasta este punto se construyó la base funcional del proyecto NIRVANA BAR MENU.

Parte pública
Se armó la página principal del menú digital en:
app/page.tsx

Esta página:

conecta con Supabase

lee la tabla menu_items

lee la tabla specials

muestra los specials destacados

agrupa el menú por categoría

renderiza la carta con la estética visual de NIRVANA

Parte de acceso admin
Se armó la pantalla de login en:
app/login/page.tsx

Esta página:

toma email y contraseña

usa Supabase Auth para autenticar

si el login es correcto, redirige al dashboard

Parte de gestión admin
Se armó el dashboard en:
app/dashboard/page.tsx

Esta página:

comprueba si hay sesión activa

carga los specials desde Supabase

permite editar:

plato_dia

menu_semana

vino_casa

guarda cambios en la tabla specials

permite cerrar sesión

Base visual
Se construyó una identidad visual coherente con el bar en:
app/globals.css

Con:

fondo oscuro

paneles crema/papel

acento mostaza/naranja

estilo editorial premium

Conexión a Supabase
Se centralizó en:
lib/supabaseClient.ts

Componentes reutilizables
Se crearon:

components/MenuItemCard.tsx

components/SpecialBanner.tsx

ESTRUCTURA ACTUAL DEL PROYECTO

nirvana-bar-menu/
app/
dashboard/
page.tsx
login/
page.tsx
globals.css
layout.tsx
page.tsx
components/
MenuItemCard.tsx
SpecialBanner.tsx
lib/
supabaseClient.ts
database/
schema.sql
.env.local
package.json
tsconfig.json

VARIABLES Y FUNCIONES USADAS, COMENTADAS Y EXPLICADAS

lib/supabaseClient.ts

Variables

supabaseUrl
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

Qué hace:
Guarda la URL del proyecto de Supabase.

Para qué sirve:
Es una de las dos piezas necesarias para crear la conexión con Supabase.

supabaseAnonKey
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

Qué hace:
Guarda la clave pública del proyecto.

Para qué sirve:
Permite que el frontend consulte datos permitidos por las policies.

supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

Qué hace:
Crea y exporta el cliente de Supabase.

Para qué sirve:
Se reutiliza en toda la app para:

leer datos

loguear usuarios

cerrar sesión

actualizar specials

components/MenuItemCard.tsx

Props / variables usadas

name
Nombre del ítem del menú.

description
Descripción corta del producto.

price
Precio del ítem.

category
Categoría del producto.

Para qué sirve este componente:
Mostrar un producto individual dentro de una categoría de la carta.

components/SpecialBanner.tsx

Props / variables usadas

type
Tipo técnico del special:

plato_dia

menu_semana

vino_casa

title
Título visible del special.

description
Texto descriptivo del special.

price
Precio del special.

start_time
Hora de inicio.

end_time
Hora de fin.

labels
const labels = {
plato_dia: "Plato del día",
menu_semana: "Menú de la semana",
vino_casa: "Vino de la casa",
};

Qué hace:
Traduce el valor técnico de type a un texto bonito para mostrar en pantalla.

Para qué sirve:
Evita mostrar nombres técnicos de base de datos al usuario.

app/page.tsx — página pública

Estados / variables principales

menuItems
const [menuItems, setMenuItems] = useState([]);

Qué guarda:
Todos los productos de la tabla menu_items.

Para qué sirve:
Es la base de la carta pública.

specials
const [specials, setSpecials] = useState([]);

Qué guarda:
Los specials de la tabla specials.

Para qué sirve:
Mostrar:

plato del día

menú de la semana

vino de la casa

loading
const [loading, setLoading] = useState(true);

Qué guarda:
Si la página todavía está cargando datos.

Para qué sirve:
Mostrar una pantalla de carga mientras Supabase responde.

errorMessage
const [errorMessage, setErrorMessage] = useState("");

Qué guarda:
Un mensaje de error si algo falla al cargar.

Para qué sirve:
Mostrar feedback claro en pantalla en vez de romper silenciosamente.

platoDia
const platoDia = specials.find((item) => item.type === "plato_dia");

Qué hace:
Busca dentro de specials el bloque correspondiente al plato del día.

menuSemana
const menuSemana = specials.find((item) => item.type === "menu_semana");

Qué hace:
Busca el special del menú de la semana.

vinoCasa
const vinoCasa = specials.find((item) => item.type === "vino_casa");

Qué hace:
Busca el special del vino de la casa.

groupedMenu
const groupedMenu = useMemo(() => {
return menuItems.reduce((acc, item) => {
...
}, {});
}, [menuItems]);

Qué hace:
Agrupa los productos del menú por categoría.

Para qué sirve:
Poder renderizar la carta separada por bloques como:

Tapas

Entrantes

Pinsa a la Romana

Burgers

Postres

Vinos

Funciones principales

loadMenuData()

Qué hace:
Carga todos los datos necesarios para la home pública.

Paso a paso:

activa loading

limpia errorMessage

consulta menu_items

consulta specials

guarda datos en estado

si algo falla, muestra error

al final desactiva loading

Para qué sirve:
Es la función central de carga de la home.

app/login/page.tsx — login admin

Variables / estados

email
const [email, setEmail] = useState("");

Qué guarda:
El email que escribe el admin.

password
const [password, setPassword] = useState("");

Qué guarda:
La contraseña que escribe el admin.

errorMessage
const [errorMessage, setErrorMessage] = useState("");

Qué guarda:
Error de autenticación si el login falla.

loading
const [loading, setLoading] = useState(false);

Qué guarda:
Si el login se está procesando.

Para qué sirve:
Bloquear el botón y cambiar el texto a “Entrando...”.

router
const router = useRouter();

Qué hace:
Permite navegar a otras rutas.

Para qué sirve:
Redirigir al dashboard después del login.

Funciones principales

handleLogin()

Qué hace:
Procesa el envío del formulario de login.

Paso a paso:

frena el submit normal

limpia errores previos

activa loading

llama a supabase.auth.signInWithPassword()

si falla, muestra error

si funciona, redirige a /dashboard

desactiva loading

Para qué sirve:
Es la función central del login admin.

app/dashboard/page.tsx — panel admin

Variables / estados

specials
const [specials, setSpecials] = useState([]);

Qué guarda:
Los specials editables del dashboard.

Para qué sirve:
Renderizar los formularios de edición.

loading
const [loading, setLoading] = useState(true);

Qué guarda:
Si el dashboard todavía está cargando.

errorMessage
const [errorMessage, setErrorMessage] = useState("");

Qué guarda:
Errores generales del dashboard.

router
const router = useRouter();

Para qué sirve:

redirigir a /login si no hay sesión

volver a /login al cerrar sesión

Funciones principales

checkSessionAndLoadData()

Qué hace:
Valida la sesión y luego carga los specials.

Paso a paso:

activa loading

limpia error

consulta supabase.auth.getSession()

si no hay sesión, manda a /login

si hay sesión, trae specials

guarda los specials en estado

si algo falla, muestra error

desactiva loading

Para qué sirve:
Es la función principal de arranque del dashboard.

handleChange(index, field, value)

Qué hace:
Actualiza el estado local cuando el usuario cambia un input del formulario.

Parámetros:

index: posición del special dentro del array

field: nombre del campo que cambió

value: nuevo valor

Para qué sirve:
Editar datos en pantalla antes de guardarlos en Supabase.

saveSpecial(item)

Qué hace:
Guarda en Supabase un special concreto.

Qué actualiza:

title

description

price

start_time

end_time

updated_at

Cómo encuentra el registro correcto:
usa .eq("id", item.id)

Para qué sirve:
Persistir en la base de datos los cambios hechos en el formulario.

handleLogout()

Qué hace:
Cierra la sesión actual del usuario.

Después de eso:
Redirige al login.

Para qué sirve:
Salir del panel admin de forma controlada.

RESUMEN RÁPIDO DE FUNCIONES POR ARCHIVO

app/page.tsx

loadMenuData()

app/login/page.tsx

handleLogin()

app/dashboard/page.tsx

checkSessionAndLoadData()

handleChange()

saveSpecial()

handleLogout()

RESUMEN RÁPIDO DE ESTADOS POR ARCHIVO

Home pública

menuItems

specials

loading

errorMessage

Login

email

password

errorMessage

loading

Dashboard

specials

loading

errorMessage

QUÉ DEBERÍA PODER DECIR SI LE PREGUNTAN POR LA ARQUITECTURA

“Separé el proyecto en tres áreas: visual, pública y administrativa. La parte visual se resuelve con estilos globales y componentes reutilizables. La parte pública carga el menú y los specials desde Supabase y los muestra agrupados por categoría. La parte administrativa usa Supabase Auth para login y un dashboard que permite editar los specials y guardar los cambios en la base de datos.”

NOMBRES IMPORTANTES QUE NO CONVIENE CAMBIAR

Archivos

app/page.tsx

app/login/page.tsx

app/dashboard/page.tsx

components/MenuItemCard.tsx

components/SpecialBanner.tsx

lib/supabaseClient.ts

database/schema.sql

app/layout.tsx

app/globals.css

.env.local

tsconfig.json

Tablas

public.menu_items

public.specials

Campos de menu_items

id

name

description

price

category

available

Campos de specials

id

type

title

description

price

start_time

end_time

updated_at

Valores del campo type

plato_dia

menu_semana

vino_casa

Variables del frontend

menuItems

specials

loading

errorMessage

loadMenuData

groupedMenu

platoDia

menuSemana

vinoCasa

email

password

router

checkSessionAndLoadData

handleChange

saveSpecial

handleLogout

supabase

RESUMEN FINAL

Hasta ahora el proyecto ya tiene:

base visual definida

conexión a Supabase

menú público conectado a base de datos

login admin funcionando

dashboard admin creado para editar specials

Lo que sigue después es:

pulir visualmente el dashboard

mejorar etiquetas visuales de los special types

validar mejor formularios

preparar deploy en Vercel

revisar detalle final de experiencia mobile para QR