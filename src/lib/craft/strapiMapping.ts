import { blockRegistry, type BlockKey } from './registry';

// Перевод между Dynamic Zone Strapi и деревом узлов craft.js.
//
// Маппинг общий, а не «свитч по блокам»: пара «ключ реестра ↔ имя
// Strapi-компонента» уже объявлена в registry.ts, и второй список здесь
// разошёлся бы с ним при первом же новом блоке.

/** Элемент Dynamic Zone: компонент плюс его поля. */
export interface DynamicZoneItem {
  readonly __component: string;
  readonly id?: number;
  readonly [field: string]: unknown;
}

/** Узел в формате, который понимает craft.js (query.deserialize). */
export interface CraftNode {
  readonly type: { readonly resolvedName: string };
  readonly isCanvas: boolean;
  readonly props: Record<string, unknown>;
  readonly displayName: string;
  readonly custom: Record<string, unknown>;
  readonly parent?: string;
  readonly hidden: boolean;
  readonly nodes: readonly string[];
  readonly linkedNodes: Record<string, string>;
}

export type CraftTree = Record<string, CraftNode>;

export const ROOT_ID = 'ROOT';

/**
 * Props, которые живут только в редакторе.
 *
 * `interactive` отключает лайтбокс на холсте, `viewTab`/`viewPath` помнят,
 * какую рубрику файлового менеджера открыл админ. Это состояние интерфейса,
 * а не контент: в CMS они мусор, который к тому же не описан схемой и вызовет
 * ошибку валидации.
 */
const RUNTIME_PROPS = new Set(['interactive', 'viewTab', 'viewPath', 'onViewChange']);

const KEY_BY_COMPONENT = new Map<string, BlockKey>(
  (Object.entries(blockRegistry) as [BlockKey, { strapiComponent: string }][])
    .map(([key, entry]) => [entry.strapiComponent, key]),
);

/** Медиа-поле Strapi: объект файла с числовым id и адресом. */
interface StrapiMedia {
  readonly id: number;
  readonly url: string;
  readonly name?: string;
}

function isMedia(value: unknown): value is StrapiMedia {
  if (typeof value !== 'object' || value === null) return false;
  if (!('id' in value) || !('url' in value)) return false;

  return typeof (value as StrapiMedia).id === 'number';
}

/**
 * Разворачивает то, что пришло из Strapi, в форму props блока.
 *
 * Медиа-поле отдаётся объектом файла, а блоки хранят пару `url` + `id`: `url`
 * работает как есть у публичного бакета, `id` нужен, чтобы перевыпустить
 * ссылку у приватного (docs/OPEN_QUESTIONS.md №20).
 */
function fromStrapiValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(fromStrapiValue);

  if (isMedia(value)) {
    // Наружу отдаётся путь к своему прокси, а не адрес в CMS/бакете: файлы
    // приватные (решение пользователя, 2026-08-09), и прямой адрес открывался
    // бы без пароля. `id` сохраняется — по нему прокси и достаёт файл.
    const proxied = `/api/media/file/${value.id}`;
    return {
      id: value.id, src: proxied, url: proxied, name: value.name,
    };
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        // id самого компонента в props не нужен — он про строку в базе.
        // eslint-disable-next-line no-underscore-dangle -- имя поля задаёт Strapi
        .filter(([key]) => key !== 'id' && key !== '__component')
        .map(([key, nested]) => [key, fromStrapiValue(nested)]),
    );
  }

  return value;
}

/**
 * Сворачивает props обратно в то, что примет Strapi.
 *
 * Медиа передаётся числовым upload-id, а не объектом (§3.5 ТЗ). Поля `id`
 * вложенных компонентов вырезаются: Strapi v5 отвечает 400, если они пришли
 * в теле запроса.
 */
function toStrapiValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toStrapiValue);

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;

    // Файл, разложенный на url+id, сворачивается обратно в upload-id.
    if (typeof record.id === 'number' && (typeof record.src === 'string' || typeof record.url === 'string')) {
      return record.id;
    }

    return Object.fromEntries(
      Object.entries(record)
        .filter(([key]) => key !== 'id')
        .map(([key, nested]) => [key, toStrapiValue(nested)]),
    );
  }

  return value;
}

/** Dynamic Zone из Strapi → дерево узлов для craft.js. */
export function dynamicZoneToCraft(items: readonly DynamicZoneItem[]): CraftTree {
  const ids: string[] = [];
  const tree: Record<string, CraftNode> = {};

  items.forEach((item, index) => {
    // eslint-disable-next-line no-underscore-dangle -- имя поля задаёт Strapi
    const key = KEY_BY_COMPONENT.get(item.__component);
    // Неизвестный компонент пропускаем, а не роняем редактор: в CMS мог
    // остаться блок, который из кода уже убрали.
    if (!key) return;

    const nodeId = `node-${index}`;
    ids.push(nodeId);

    tree[nodeId] = {
      type: { resolvedName: key },
      isCanvas: false,
      props: fromStrapiValue(item) as Record<string, unknown>,
      displayName: blockRegistry[key].label,
      custom: {},
      parent: ROOT_ID,
      hidden: false,
      nodes: [],
      linkedNodes: {},
    };
  });

  tree[ROOT_ID] = {
    type: { resolvedName: 'EditorCanvas' },
    isCanvas: true,
    props: {},
    displayName: 'Страница',
    custom: {},
    hidden: false,
    nodes: ids,
    linkedNodes: {},
  };

  return tree;
}

/** Дерево craft.js → Dynamic Zone для отправки в Strapi. */
export function craftToDynamicZone(tree: CraftTree): DynamicZoneItem[] {
  const root = tree[ROOT_ID];
  if (!root) return [];

  return root.nodes.flatMap((nodeId) => {
    const node = tree[nodeId];
    if (!node) return [];

    const key = node.type.resolvedName as BlockKey;
    const entry = blockRegistry[key];
    // Холст и любой неизвестный узел в контент не попадают.
    if (!entry) return [];

    const props = Object.fromEntries(
      Object.entries(node.props).filter(([name]) => !RUNTIME_PROPS.has(name)),
    );

    return [{
      __component: entry.strapiComponent,
      ...(toStrapiValue(props) as Record<string, unknown>),
    }];
  });
}
