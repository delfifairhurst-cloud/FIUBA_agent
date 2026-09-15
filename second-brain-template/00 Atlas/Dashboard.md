# 🧠 Segundo Cerebro

> Laboratorio personal / biblioteca intelectual / red neuronal.
> No es un planner. Es donde pienso.

---

## Explorar

- 🗺️ [[Mapa - Matemática]]
- 🗺️ [[Mapa - Física]]
- 🗺️ [[Mapa - Ingeniería y Tecnología]]
- 📚 [[Área - Matemática]] · [[Área - Física]] · [[Área - Filosofía]] · [[Área - Astronomía]]
- 🎓 [[Área - CBC]] · [[Área - FIUBA]]
- 💡 [Ideas](obsidian://open?path=03%20Ideas)
- ❓ [Preguntas abiertas](obsidian://open?path=02%20Preguntas)
- 🔬 [[FIUBA Agent]]
- 📖 [Recursos](obsidian://open?path=05%20Recursos)

---

## Recientes

```dataview
TABLE tipo, area, estado
FROM "01 Conceptos" OR "02 Preguntas" OR "03 Ideas"
SORT fecha DESC
LIMIT 8
```

*Si no usas Dataview, reemplaza por tu lista manual de últimas notas.*

---

## Preguntas abiertas

```dataview
TABLE area
FROM "02 Preguntas"
WHERE estado = "abierta"
SORT fecha DESC
LIMIT 6
```

---

## Ideas para explorar

```dataview
TABLE area
FROM "03 Ideas"
SORT fecha DESC
LIMIT 5
```

---

### Atajo mental

`Tengo una idea → Crear nota → Escribir → Enlazar 2-3 [[Conceptos]] → Listo.`

No decidas carpeta perfecta, tags perfectos o 15 propiedades. Enlaza y sigue pensando.
