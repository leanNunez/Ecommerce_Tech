# Plan de Tareas — AI Commerce (para Claude Code)

## 0) Epic y orden de ejecución
1. **EPIC-A:** Search semántica + recomendador (MVP)
2. **EPIC-B:** Asistente de compra con tool-calling
3. **EPIC-C:** Hardening production-grade
4. **EPIC-D:** Documentación y portfolio positioning

---

## EPIC-A — Search semántica + recomendador

### A1. Diseño técnico y decisiones
- [ ] Definir provider de embeddings (Gemini embeddings u otro).
- [ ] Elegir vector store (pgvector o ChromaDB) y documentar decisión.
- [ ] Definir esquema de documento de producto para embedding (title, description, category, attributes, brand, tags).
- [ ] Definir estrategia de búsqueda híbrida (keyword + vector) y fórmula de score.
- [ ] Definir criterios de relevancia esperada (casos de prueba funcionales).

### A2. Modelo de datos / persistencia
- [ ] Crear migraciones para almacenar embedding por producto/variante.
- [ ] Agregar campos de metadatos necesarios para ranking (popularidad, stock, margin opcional).
- [ ] Crear índices para búsqueda textual (full-text) y para vector similarity.
- [ ] Implementar versionado de embeddings (campo `embedding_version`).

### A3. Pipeline de ingest y reindex
- [ ] Implementar script `index-products` para generar embeddings masivos.
- [ ] Implementar modo incremental (solo productos nuevos/actualizados).
- [ ] Implementar comandos:
  - [ ] `index:full`
  - [ ] `index:changed`
  - [ ] `index:product --id`
- [ ] Persistir logs de indexación (total, éxito, fallos, duración).
- [ ] Implementar retry/backoff ante errores del proveedor de embeddings.

### A4. API de búsqueda híbrida
- [ ] Crear endpoint `GET /search`.
- [ ] Soportar filtros (categoría, precio, marca, stock, rating).
- [ ] Implementar ranking híbrido (textual + semántico).
- [ ] Exponer campos de explicación de ranking (opcional: `why_matched`).
- [ ] Agregar paginación y ordenamiento.
- [ ] Validar inputs con schema validation.
- [ ] Manejar errores y timeouts de forma consistente.

### A5. Recomendaciones
- [ ] Crear endpoint `GET /products/:id/similar`.
- [ ] Definir reglas de exclusión (mismo producto, sin stock, etc.).
- [ ] Agregar diversificación de resultados (evitar resultados casi idénticos).
- [ ] Implementar fallback si no hay embeddings (top populares por categoría).

### A6. Frontend búsqueda inteligente
- [ ] Crear UI de “búsqueda inteligente”.
- [ ] Integrar filtros + resultados híbridos.
- [ ] Mostrar estado de carga/empty/error.
- [ ] Agregar bloque “Productos similares” en PDP.
- [ ] Medir interacción de usuarios (clicks en resultados).

### A7. Calidad
- [ ] Tests unitarios para ranking y utilidades de scoring.
- [ ] Tests de integración para endpoints de search/similar.
- [ ] Dataset pequeño de pruebas de relevancia (queries esperadas).
- [ ] Pruebas de performance básicas del endpoint (`p95`, throughput).

---

## EPIC-B — Asistente de compra con tool-calling

### B1. Contrato del asistente
- [ ] Definir alcance funcional del asistente (recomendar, comparar, agregar al carrito, FAQ de compra).
- [ ] Definir policy de respuestas (no inventar datos de catálogo/precio/stock).
- [ ] Definir idioma(s), tono y límites.
- [ ] Definir formato de respuesta para UI (texto + acciones sugeridas).

### B2. Herramientas (tools) backend
- [ ] Implementar `searchProducts(query, filters)`.
- [ ] Implementar `getProductDetails(productId)`.
- [ ] Implementar `compareProducts(productIds[])`.
- [ ] Implementar `addToCart(productId, variantId, qty)`.
- [ ] Implementar `getCartSummary(session/user)`.

### B3. Orquestador LLM
- [ ] Crear servicio `assistant-orchestrator`.
- [ ] Implementar ciclo tool-calling (invocación + resultados + respuesta final).
- [ ] Implementar memoria corta de conversación por sesión.
- [ ] Implementar guardrails de seguridad y validación de tool arguments.
- [ ] Implementar fallback de modelo (si aplica).

### B4. API del asistente
- [ ] Crear endpoint `POST /ai/assistant/chat`.
- [ ] Soportar streaming de respuesta.
- [ ] Agregar auth/session binding para acciones sobre carrito.
- [ ] Agregar rate limiting específico para endpoints AI.
- [ ] Estandarizar errores (`429`, `5xx`, timeout, provider unavailable).

### B5. UI chat en e-commerce
- [ ] Crear widget de chat reutilizable.
- [ ] Agregar quick actions (recomendar, comparar, presupuesto).
- [ ] Mostrar acciones ejecutables (ej. “Agregar al carrito”).
- [ ] Manejar estados (typing, loading, retry).
- [ ] Persistir historial corto en sesión del navegador.

### B6. Seguridad y compliance básica
- [ ] Sanitizar input/output del usuario.
- [ ] Bloquear prompt injection obvia para tools sensibles.
- [ ] Definir política de datos (qué se guarda y cuánto tiempo).
- [ ] Redactar disclaimer de IA en UI.

### B7. Calidad
- [ ] Tests unitarios del orquestador.
- [ ] Tests de integración del flujo tool-calling.
- [ ] Tests E2E: usuario consulta → recibe recomendación → agrega al carrito.
- [ ] Pruebas de resiliencia ante caída del provider LLM.

---

## EPIC-C — Hardening production-grade

### C1. CI/CD
- [ ] Crear workflow backend: lint + typecheck + tests + build.
- [ ] Crear workflow frontend: lint + typecheck + tests + build.
- [ ] Ejecutar checks en PR y push a rama principal.
- [ ] Agregar badges de estado al README.
- [ ] Configurar bloqueo de merge si checks fallan.

### C2. Observabilidad
- [ ] Implementar logging estructurado con `requestId`.
- [ ] Agregar middleware de correlación de requests.
- [ ] Implementar `/health` y `/ready`.
- [ ] Instrumentar métricas básicas (latencia, error rate, AI calls).
- [ ] Crear dashboard mínimo (aunque sea básico).

### C3. Seguridad
- [ ] Revisar CORS y headers de seguridad.
- [ ] Implementar rate limiting en auth y AI endpoints.
- [ ] Validación estricta de payloads en todos los endpoints críticos.
- [ ] Revisar manejo seguro de secrets y rotación.
- [ ] Auditoría de dependencias y vulnerabilidades.

### C4. Performance
- [ ] Definir presupuesto de latencia para endpoints críticos.
- [ ] Optimizar consultas de catálogo y búsqueda.
- [ ] Implementar caching en rutas de alta lectura.
- [ ] Evaluar compresión y optimizaciones frontend (bundle splitting).
- [ ] Ejecutar smoke load test y guardar resultados.

### C5. Resiliencia
- [ ] Timeouts explícitos hacia servicios externos.
- [ ] Circuit breaker/retry para llamadas a providers AI.
- [ ] Fallback funcional cuando AI no esté disponible.
- [ ] Manejo consistente de errores de DB y red.

### C6. Entornos
- [ ] Verificar paridad de variables entre local/staging/prod.
- [ ] Documentar configuración de deploy (Vercel + Render).
- [ ] Crear checklist de release manual.
- [ ] Crear rollback plan básico.

---

## EPIC-D — Documentación y posicionamiento (reclutador)

### D1. README principal (Ecommerce_Tech)
- [ ] Agregar sección “AI Features”.
- [ ] Incluir arquitectura de alto nivel (diagrama simple).
- [ ] Documentar endpoints de search/recommend/chat.
- [ ] Agregar instrucciones de indexación de embeddings.
- [ ] Agregar “Known tradeoffs” y próximos pasos.

### D2. Demo y DX
- [ ] Añadir credenciales demo (admin/user) o seed script equivalente.
- [ ] Agregar colección de requests (Postman/Bruno) para API.
- [ ] Incluir script de setup rápido para evaluadores.
- [ ] Crear “demo script” (pasos de 3 min para mostrar valor).

### D3. Portfolio / narrativa
- [ ] Actualizar myportfolio con sección “AI Commerce”.
- [ ] Enlazar producción de e-commerce y chatbot.
- [ ] Resumir impacto técnico en bullets claros.
- [ ] Agregar capturas o GIFs de búsqueda inteligente y chat.
- [ ] Limpiar README del frontend del chatbot (quitar template default).

---

## Backlog técnico transversal (aplicar en todos los epics)
- [ ] Definir convención de commits y PR templates.
- [ ] Definir Definition of Done por feature.
- [ ] Mantener changelog de releases.
- [ ] Etiquetar issues por prioridad (`P0/P1/P2`) y tipo (`feat/fix/chore/docs`).
- [ ] Crear milestones por semana.

---

## Prioridad recomendada (si necesitas recortar)
1. A4 + A5 + A6 (search + similar + UI)
2. B2 + B3 + B4 + B5 (assistant end-to-end)
3. C1 + C2 + C3 (CI + observabilidad + seguridad mínima)
4. D1 + D3 (README + portfolio narrative)

---

## Definition of Done global
- [ ] Feature desplegada en producción.
- [ ] Tests pasando en CI.
- [ ] Telemetría mínima disponible.
- [ ] Documentación actualizada.
- [ ] Demo reproducible en < 5 minutos.