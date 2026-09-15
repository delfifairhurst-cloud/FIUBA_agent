# Segundo Cerebro — FIUBA Agent Template

Este vault es una **plantilla mínima funcional** inspirada en tu prompt. No inventa tu conocimiento, te da el andamiaje para que lo construyas.

## Arquitectura elegida (por qué así)

**Pocas carpetas, muchos enlaces.** La estructura no organiza tu conocimiento — lo hace tu red de [[Wikilinks]].

```
00 Atlas/        → Mapas y Dashboard (dónde estoy)
01 Conceptos/    → Una idea = una nota (átomo de conocimiento)
02 Preguntas/    → Preguntas abiertas que guían el aprendizaje
03 Ideas/        → Hipótesis y asociaciones propias
04 Proyectos/    → Lo que estás construyendo
05 Recursos/     → Fuentes (libros, papers, videos)
06 Áreas/        → Índices vivos por dominio (no carpetas gigantes)
99 Templates/    → Plantillas simples
```

**Por qué cada una:**
- **01 Conceptos:** el corazón. Si todo fueran clases (`Clase 12-09`), nada sería reutilizable. Un concepto sí.
- **02 Preguntas:** separa lo que no sabes de lo que crees saber. Una pregunta puede *convertirse* en concepto.
- **03 Ideas:** tu voz. Sin esto, el vault es Wikipedia personal.
- **04 Proyectos:** da contexto a por qué aprendes algo.
- **05 Recursos:** la fuente no es el conocimiento. Guardas extractos con tus palabras.
- **06 Áreas:** contextos, no contenedores. [[Área - Matemática]] no *contiene* todo de matemática, *conecta* lo importante.
- **00 Atlas:** para no perderte. Dashboard + MOCs (Maps of Content).
- **Inbox:** si te da fiaca decidir, tira la nota ahí y procesa después. (Puedes usar 00 Atlas/Inbox o simplemente crear en raíz y mover).

## Qué creé

- **6 templates** en `99 Templates/` (concepto, pregunta, idea, proyecto, recurso, área) — simples, sin burocracia.
- **Dashboard** en `00 Atlas/Dashboard.md` (Explorar + Recientes + Preguntas/Ideas) con queries Dataview opcionales.
- **3 MOCs** en `00 Atlas/Mapa - ...` (Matemática, Física, Ingeniería) con relaciones, preguntas y puentes interdisciplinarios.
- **4 Áreas** en `06 Áreas/` (Matemática, Física, Filosofía, etc.) como índices.
- **5 notas de ejemplo** en `01 Conceptos/` (Derivada, Aproximación lineal, Taylor, Serie de Fourier, Onda) que demuestran enlaces reales.
- **2 preguntas**, **1 idea**, **1 proyecto** de ejemplo.

No borré nada. Si tu vault tenía contenido, sigue intacto. Esto se puede copiar encima.

## Cómo usarlo (flujo de 20 segundos)

1. **Tienes una idea** (leyendo, en clase, duchándote).
2. `Ctrl+N` → elige template (Concepto si es conocimiento, Pregunta si es duda, Idea si es hipótesis).
3. Escribe 3-6 líneas. No tesis.
4. Enlaza 2-3 `[[Conceptos]]` existentes. Si no existen, `[[NuevoConcepto]]` queda en rojo — lo crearás después.
5. Guarda. Listo. Sigue leyendo.

**Regla de oro:** una nota = una idea. Si separar destruye el contexto, mantenlo junto. Flexibilidad > rigidez.

## Qué NO hacer

- No crees `Clase 2026-09-12` con 4 páginas de transcripción. Extrae 2-3 conceptos a `01 Conceptos/` y deja la clase como recurso en `05 Recursos/`.
- No enlaces artificiales solo para que el grafo se vea denso. Cada `[[link]]` debe ser una relación intelectual real.
- No llenes frontmatter con 10 propiedades. `tipo`, `area`, `estado`, `fecha` alcanzan. Añade solo si resuelve un problema concreto (ej: filtrar preguntas abiertas).
- No instales 20 plugins el día 1. Ver abajo.

## Plugins

**Esenciales (instalar ya):**
- *Templater* o *Core Templates* — para usar `99 Templates/` con `{{title}}` y `{{date}}`. Sin esto, los templates son copia/pega manual.
- *Dataview* (opcional pero recomendado) — para que Dashboard muestre Recientes/Preguntas automáticamente. Si no lo quieres, Dashboard funciona manual.

**Opcionales (cuando duela no tenerlos):**
- *Calendar* — si usas notas diarias.
- *Outliner* — si haces listas largas.

**Futuro (cuando el vault tenga 100+ notas):**
- *Excalidraw* — para diagramas que conecten conceptos visualmente.
- *Spaced Repetition* — si quieres repasar conceptos dentro de Obsidian.
- *Omnisearch* — búsqueda mejorada.

No instales más por ahora.

## Próximo paso natural

1. **Copia** esta carpeta `second-brain-template/` dentro de tu vault real (o copia su contenido a la raíz).
2. Configura Templates: Settings → Core Plugins → Templates → carpeta `99 Templates`.
3. Abre `00 Atlas/Dashboard.md` y ponlo como homepage (o usa plugin *Homepage*).
4. **Crea tus primeras 3 notas reales** hoy, con tus palabras, siguiendo el flujo de 20 segundos. No más.
5. En una semana, abre Graph View. Verás tu primera red real: `Derivada → Taylor → Física`, no porque lo forzaste, sino porque pensaste así.

Cuando tengas ~30 notas, volvemos y pulimos MOCs y conexiones juntos.

---

*Estética:* laboratorio personal / biblioteca intelectual / red neuronal. Sin colores corporativos. Emojis moderados. El contenido es la protagonista.
