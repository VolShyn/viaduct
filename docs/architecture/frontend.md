# Frontend architecture

Гибрид Feature-Sliced Design и вертикальных модулей. Слои строгие, фичи автономны,
plugins — точка расширения, а не место для логики.

Пошаговый план миграции — в [frontend-refactoring-plan.md](../frontend-refactoring-plan.md).
Этот документ описывает целевое состояние и правила, которые уже действуют.

---

## Слои

```
src/
├── app/          # bootstrap, routing, providers      (алиас @app)
├── shared/       # transport, generic lib, ui-примитивы (алиас @shared)
├── entities/     # доменные типы и mappers, без UI     (алиас @entities)
├── features/     # user-facing capabilities            (алиас @features)
├── widgets/      # композиции фич                      (алиас @widgets)
└── plugins/      # extension boundary                  (алиас @plugins)
```

Направление зависимостей — только вниз:

| Слой | Может импортировать |
|------|---------------------|
| `shared` | ничего из слоёв выше |
| `entities` | `shared` |
| `features` | `shared`, `entities`, другие фичи **только через public index** |
| `widgets` | `features` (через public index), `entities`, `shared` |
| `plugins` | `features` (через public index), `shared` |
| `app` | всё |

Правила выражены в `eslint.config.js` через `@typescript-eslint/no-restricted-imports`
и падают ошибкой, включая `import type`. Ограничены только слоевые директории:
дорефакторные `components/`, `pages/`, `utils/` и `state/` слоя пока не имеют,
поэтому правил на них нет — они появятся вместе с переездом.

---

## Серверное состояние: React Query

Всё, что приходит с сервера, живёт в кэше React Query, а не в самодельных сторах.
Клиент и его дефолты — в `shared/api/query/queryClient.ts`, провайдер — в
`app/providers/QueryProvider.tsx`.

Что задано глобально и почему:

| Дефолт | Причина |
|--------|---------|
| `retry`: не повторять 4xx | 401 уже сообщил AuthProvider о конце сессии, 403 — это отказ. Повтор лишь оттягивает сообщение |
| `refetchIntervalInBackground: false` | Скрытая вкладка не спрашивает ничего |
| `mutations.retry: false` | Повторять запись вслепую небезопасно |

Транспорт остаётся общим: все запросы идут через `shared/api/http/client.ts`,
поэтому фоновые рефетчи автоматически получают `X-Session-Probe: idle` и не
продлевают сессию, а 401 по-прежнему поднимает `onUnauthorized`.

Ключи запросов принадлежат фиче (`model/<name>.keys.ts`) и строятся иерархически,
чтобы префикс инвалидировал всё под собой.

### Что осталось вне React Query

- **Модель проекта.** Синхронизируется через Yjs — это отдельный источник правды,
  дублировать её в кэш нельзя.
- **UI-состояние.** Какая панель открыта, какой оверлей показан — крошечные
  сторы на `useSyncExternalStore` внутри фичи.
- **Вызовы вне React.** `utils/serviceContract.ts`, `utils/exportElement.ts`,
  `utils/imageExport.ts`, `data/templates/starterModel.ts`,
  `plugins/sequence-editor/uiState.ts` дёргают API напрямую — хуков там нет.

---

## Эталон: `features/threads`

Референсная реализация всего стека. Новую фичу проще всего начать, скопировав её.

```
features/threads/
├── api/threads.api.ts        # окно фичи в transport: единственное место,
│                             # где видно, какие endpoints она вообще трогает
├── model/
│   ├── thread.types.ts       # типы фичи
│   ├── threads.keys.ts       # ключи запросов
│   ├── threads.queries.ts    # useThreadsQuery, useVisibleThreads, ...
│   ├── threads.mutations.ts  # запись + что она значит для кэша
│   ├── threads.cache.ts      # чистые трансформации кэша (тестируются напрямую)
│   ├── threadUi.store.ts     # только UI-состояние: открытый тред, активный проект
│   └── viewScope.ts          # чистая доменная логика
├── ui/
│   ├── ThreadNode/           # компонент + .types.ts + .constants.ts + index.ts
│   ├── ThreadPanel/          # компонент + .utils.tsx + Avatar.tsx + index.ts
│   ├── CommentInput/
│   └── ThreadsToolbarButton/
├── __tests__/
└── index.ts                  # public API
```

### Что даёт этот разрез

**Мутации владеют парой «запрос + следствие для кэша».** Раньше каждая точка
вызова складывала её сама, и они разъехались: канвас двигал тред оптимистично, а
панель ждала ответа сервера. Теперь политика выбрана осознанно и в одном месте:
драг оптимистичен с откатом при отказе, всё остальное ждёт сервер.

**Чистые трансформации кэша вынесены отдельно.** `threads.cache.ts` не знает про
React и React Query, поэтому оптимистичное поведение проверяется без рендерера.

**Компоненты не знают про `api.*`.** Они читают кэш через query-хуки и пишут
через mutation-хуки.

**Ключи и трансформации кэша не в public API.** Наружу торчат хуки и компоненты —
воспроизвести (и разрушить) правила кэша снаружи нельзя.

**Плагин — тонкий адаптер.** `plugins/threads/index.ts` только регистрирует портал:

```ts
const plugin: C4Plugin = {
  name: 'threads',
  version: '0.1.0',
  setup(registry) {
    registry.registerPortal('tools-rail-actions', createElement(ThreadsToolbarButton));
  },
};
```

---

## Конвенции

### Именование

| Что | Паттерн |
|-----|---------|
| API | `*.api.ts` |
| Ключи запросов | `*.keys.ts` |
| Чтение | `*.queries.ts` |
| Запись | `*.mutations.ts` |
| UI-состояние | `*.store.ts` |
| Директория компонента | `PascalCase/` |
| Чистая логика | `model/`, `lib/` или `domain/` |

### Colocation

Константы, типы, утилиты и тесты живут внутри директории компонента или фичи.
В `shared/` попадает только то, что реально нужно двум и более фичам. «Утилиты на
весь проект» без явного shared-статуса заводить нельзя.

### Public API фичи

`features/<name>/index.ts` — единственная точка входа снаружи. Внутренности
(`ui/ThreadNode/ThreadNode.constants`, `model/threads.store`) наружу не экспортируются;
попытка импортировать их напрямую падает на eslint-границе.

### Тесты

Рядом с кодом, в `__tests__/` внутри фичи. Переносятся вместе с кодом в том же
PR, а не «потом».

---

## Состояние миграции

| Готово | Осталось |
|--------|----------|
| `shared/api` — единственная точка HTTP; фасад `api/client.ts` удалён | data-flows / service-catalog страницы на RQ (опционально) |
| `shared/lib/userActivity` | остальной `state/*` → `features/*/model/` |
| `widgets/editor-workspace` вместо god-компонента `EditorPage` | `widgets/canvas` из `FlowCanvas` + `EditorCanvasGraph` |
| `features/threads` end-to-end на React Query | sharing, остальные `api.*` |
| `features/projects` дерево + editor detail/save на React Query | sharing, остальные `api.*` |
| `features/docs` документация проекта на React Query | sharing, остальные `api.*` |
| `features/versions` снимки и diff на React Query | sharing, остальные `api.*` |
| `features/change-sets` каталог change sets на React Query | sharing, остальные `api.*` |
| `features/service-catalog` каталог сервисов на React Query | sharing, остальные `api.*` |
| `features/data-flows` persist/delete flows + sequences на React Query | sharing, остальные `api.*` |
| `features/domains` domain map, cross-workspace search, overlay UI store | sharing, остальные `api.*` |
| QueryClient, провайдер, дефолты | перевести на React Query остальные файлы с `api.*` |
| eslint-границы слоёв | правила на `components/`, `pages/`, `utils/` после переезда |
