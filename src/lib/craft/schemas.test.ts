import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// REG-001/002 из _qa/qa-analysis.md — страж согласованности реестра блоков и
// схем Strapi.
//
// До появления этого файла соответствие держалось на ручной аккуратности:
// поле, добавленное в блок и забытое в схеме, обнаружилось бы только когда
// редактор сохранит контент, которого CMS не примет. Проверка читает исходники
// как текст (а не импортирует модули): реестр тянет за собой React-компоненты
// и SCSS-модули, которые в node не нужны и только замедлили бы тест.

const ROOT = path.resolve(__dirname, '../../..');
const SCHEMAS = path.join(ROOT, 'strapi-schemas');

interface StrapiAttribute {
  readonly type: string;
  readonly component?: string;
  readonly components?: readonly string[];
  readonly enum?: readonly string[];
}

interface StrapiSchema {
  readonly attributes: Record<string, StrapiAttribute>;
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf-8')) as T;
}

/** Все компоненты из strapi-schemas, ключ — uid вида `sections.media`. */
function loadComponents(): Map<string, StrapiSchema> {
  const dir = path.join(SCHEMAS, 'components');
  const result = new Map<string, StrapiSchema>();

  // withFileTypes — иначе на macOS в обход попадает .DS_Store и readdirSync
  // падает на нём как на «не каталоге».
  readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .forEach((namespaceDir) => {
      const namespace = namespaceDir.name;
      const nsDir = path.join(dir, namespace);

      readdirSync(nsDir)
        .filter((file) => file.endsWith('.json'))
        .forEach((file) => {
          const uid = `${namespace}.${file.replace(/\.json$/, '')}`;
          result.set(uid, readJson<StrapiSchema>(path.join(nsDir, file)));
        });
    });

  return result;
}

/** Записи реестра: ключ блока → имя Strapi-компонента и папка с исходниками. */
interface RegistryEntry {
  readonly key: string;
  readonly uid: string;
  readonly dir: string;
}

function loadRegistry(): RegistryEntry[] {
  const source = readFileSync(path.join(ROOT, 'src/lib/craft/registry.ts'), 'utf-8');
  const entries = [...source.matchAll(/(\w+): \{\s*strapiComponent: '([^']+)',/g)];
  const dirs = [...source.matchAll(/from '@\/components\/blocks\/(\w+)\/craft'/g)]
    .map((match) => match[1] ?? '');

  return entries.flatMap((match) => {
    const key = match[1];
    const uid = match[2];
    if (!key || !uid) return [];

    // Ключ реестра и имя папки различаются (text → TextBlock), поэтому папка
    // ищется среди импортов craft-обёрток по началу имени.
    const dir = dirs.find((name) => name.toLowerCase().startsWith(key.toLowerCase())) ?? '';
    return [{ key, uid, dir }];
  });
}

/** Имена props из главного интерфейса блока. */
function propsOf(dir: string): string[] {
  const file = path.join(ROOT, 'src/components/blocks', dir, 'types.ts');
  if (!existsSync(file)) return [];
  const source = readFileSync(file, 'utf-8');
  const block = /export interface \w+Props \{([\s\S]*?)\n\}/.exec(source);
  if (!block?.[1]) return [];

  return [...block[1].matchAll(/readonly (\w+)\??:/g)]
    .map((match) => match[1])
    .filter((name): name is string => Boolean(name));
}

// Props, которые существуют только в рантайме редактора и в CMS не уезжают.
const RUNTIME_ONLY = new Set(['interactive', 'viewTab', 'viewPath', 'onViewChange']);

// Поля, которые в Strapi называются иначе, чем в props: media-поле отдаёт
// объект файла, а блок раскладывает его на url/id.
const MEDIA_FIELD_ALIASES: Record<string, readonly string[]> = {
  'shared.file-entry': ['url', 'id'],
  'shared.font-specimen': ['fontUrl', 'fontId'],
};

/** Схемы контент-типов из strapi-schemas/api. */
function contentTypes(): StrapiSchema[] {
  const dir = path.join(SCHEMAS, 'api');
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((api) => {
      const file = path.join(dir, api.name, 'content-types', api.name, 'schema.json');
      return existsSync(file) ? [readJson<StrapiSchema>(file)] : [];
    });
}

const components = loadComponents();
const registry = loadRegistry();

describe('реестр блоков ↔ схемы Strapi', () => {
  it('в реестре есть блоки', () => {
    expect(registry.length).toBeGreaterThan(0);
  });

  it.each(registry)('у блока $key есть схема $uid', ({ uid }) => {
    expect(components.has(uid)).toBe(true);
  });

  it('нет схем-сирот: на каждую кто-то ссылается', () => {
    const referenced = new Set(registry.map((entry) => entry.uid));

    // Ссылаться может и компонент, и контент-тип: навигацию бренда, например,
    // держит api/brand-navigation, а не блок редактора.
    [...components.values(), ...contentTypes()].forEach((schema) => {
      Object.values(schema.attributes).forEach((attribute) => {
        if (attribute.component) referenced.add(attribute.component);
        attribute.components?.forEach((uid) => referenced.add(uid));
      });
    });

    expect([...components.keys()].filter((uid) => !referenced.has(uid))).toEqual([]);
  });

  it('все вложенные компоненты существуют', () => {
    const broken: string[] = [];
    components.forEach((schema, uid) => {
      Object.entries(schema.attributes).forEach(([name, attribute]) => {
        if (attribute.component && !components.has(attribute.component)) {
          broken.push(`${uid}.${name} → ${attribute.component}`);
        }
      });
    });

    expect(broken).toEqual([]);
  });
});

describe('поля блока ↔ поля схемы', () => {
  it.each(registry)('$key: набор полей совпадает', ({ uid, dir }) => {
    const schema = components.get(uid);
    expect(schema, `нет схемы ${uid}`).toBeDefined();

    const props = propsOf(dir).filter((name) => !RUNTIME_ONLY.has(name));
    const attributes = Object.keys(schema!.attributes);

    expect(new Set(props)).toEqual(new Set(attributes));
  });
});

describe('вложенные типы: media-поля раскладываются на url/id', () => {
  it.each(Object.entries(MEDIA_FIELD_ALIASES))('%s хранит файл media-полем', (uid) => {
    const schema = components.get(uid);
    expect(schema).toBeDefined();

    const hasMedia = Object.values(schema!.attributes).some((attribute) => attribute.type === 'media');
    expect(hasMedia, `${uid} обязан хранить сам файл media-полем`).toBe(true);
  });
});

describe('Dynamic Zone страницы гайдлайна', () => {
  const page = readJson<StrapiSchema>(
    path.join(SCHEMAS, 'api/guideline-page/content-types/guideline-page/schema.json'),
  );

  it('перечисляет ровно те компоненты, что в реестре', () => {
    // Иначе админ соберёт в редакторе блок, который CMS откажется принять.
    expect(new Set(page.attributes.content?.components ?? [])).toEqual(
      new Set(registry.map((entry) => entry.uid)),
    );
  });

  it('бренды совпадают с реестром брендов', () => {
    // Реестр — единственный источник: из него же строятся дропдаун, маршруты
    // и разделы. Если в CMS список короче, редактор не сможет завести
    // страницу для бренда, который есть в интерфейсе.
    const source = readFileSync(path.join(ROOT, 'src/lib/brands.ts'), 'utf-8');
    const list = source.split('export const brands = [')[1] ?? '';
    const ids = [...list.matchAll(/^ {4}id: '([\w-]+)',$/gm)].map((match) => match[1] ?? '');

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(page.attributes.brand?.enum ?? [])).toEqual(new Set(ids));
  });
});
