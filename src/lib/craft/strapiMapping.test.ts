import { describe, expect, it } from 'vitest';
import {
  craftToDynamicZone,
  dynamicZoneToCraft,
  ROOT_ID,
  type CraftTree,
  type DynamicZoneItem,
} from './strapiMapping';

// Маппер между CMS и редактором. Ошибка здесь не видна глазом: контент
// сохранится «успешно», но потеряет поля или получит 400 от Strapi.

describe('Strapi → craft.js', () => {
  it('раскладывает Dynamic Zone в узлы под корнем, сохраняя порядок', () => {
    const tree = dynamicZoneToCraft([
      { __component: 'sections.text-block', id: 7, title: 'Тайп' },
      {
        __component: 'sections.divider', id: 8, spacing: 'roomy', line: true,
      },
    ]);

    expect(tree[ROOT_ID]?.nodes).toHaveLength(2);
    const [first, second] = tree[ROOT_ID]!.nodes;
    expect(tree[first!]?.type.resolvedName).toBe('text');
    expect(tree[second!]?.type.resolvedName).toBe('divider');
  });

  it('корень — холст с правильным именем компонента', () => {
    // Резолвер обязан знать холст, иначе craft.js падает с "Invariant failed".
    const root = dynamicZoneToCraft([])[ROOT_ID];
    expect(root?.type.resolvedName).toBe('EditorCanvas');
    expect(root?.isCanvas).toBe(true);
  });

  it('не тащит в props служебные поля Strapi', () => {
    const tree = dynamicZoneToCraft([{ __component: 'sections.divider', id: 42, line: false }]);
    const node = tree[tree[ROOT_ID]!.nodes[0]!]!;

    expect(node.props).not.toHaveProperty('id');
    expect(node.props).not.toHaveProperty('__component');
    expect(node.props.line).toBe(false);
  });

  it('медиа-объект разворачивает в пару url + id', () => {
    // id нужен, чтобы перевыпустить presigned-ссылку у приватного бакета.
    const tree = dynamicZoneToCraft([{
      __component: 'sections.media',
      layout: 'wide',
      images: [{ id: 3, url: '/uploads/a.png', name: 'a.png' }],
    }]);
    const node = tree[tree[ROOT_ID]!.nodes[0]!]!;
    const images = node.props.images as { id: number; src: string }[];

    expect(images[0]).toMatchObject({ id: 3, src: '/uploads/a.png' });
  });

  it('разворачивает медиа и на глубине — во вложенных компонентах', () => {
    const file = { id: 9, url: '/uploads/a.pdf' };
    const tree = dynamicZoneToCraft([{
      __component: 'sections.file-manager',
      tabs: [{
        id: 1,
        label: 'Documents',
        folders: [{ id: 2, name: 'Fonts', files: [{ id: 3, name: 'a.pdf', file }] }],
      }],
    }]);
    const node = tree[tree[ROOT_ID]!.nodes[0]!]!;
    const tabs = node.props.tabs as { folders: { files: { file: { id: number } }[] }[] }[];

    expect(tabs[0]!.folders[0]!.files[0]!.file).toMatchObject({ id: 9, src: '/uploads/a.pdf' });
  });

  it('неизвестный компонент пропускается, а не роняет редактор', () => {
    // В CMS мог остаться блок, который из кода уже убрали.
    const tree = dynamicZoneToCraft([
      { __component: 'sections.legacy-thing', foo: 1 },
      { __component: 'sections.divider' },
    ]);

    expect(tree[ROOT_ID]?.nodes).toHaveLength(1);
  });
});

type NodeSpec = Record<string, {
  resolvedName: string;
  props: Record<string, unknown>;
}>;

function craftTree(nodes: NodeSpec): CraftTree {
  const ids = Object.keys(nodes);
  return {
    [ROOT_ID]: {
      type: { resolvedName: 'EditorCanvas' },
      isCanvas: true,
      props: {},
      displayName: 'Страница',
      custom: {},
      hidden: false,
      nodes: ids,
      linkedNodes: {},
    },
    ...Object.fromEntries(ids.map((id) => [id, {
      type: { resolvedName: nodes[id]!.resolvedName },
      isCanvas: false,
      props: nodes[id]!.props,
      displayName: '',
      custom: {},
      parent: ROOT_ID,
      hidden: false,
      nodes: [],
      linkedNodes: {},
    }])),
  };
}

describe('craft.js → Strapi', () => {
  it('превращает узлы в Dynamic Zone с именами компонентов', () => {
    const zone = craftToDynamicZone(craftTree({
      a: { resolvedName: 'text', props: { title: 'Тайп' } },
      b: { resolvedName: 'divider', props: { spacing: 'compact' } },
    }));
    // eslint-disable-next-line no-underscore-dangle -- имя поля задаёт Strapi
    const names = zone.map((item) => item.__component);

    expect(names).toEqual(['sections.text-block', 'sections.divider']);
    expect(zone[0]).toMatchObject({ title: 'Тайп' });
  });

  it.each(['interactive', 'viewTab', 'viewPath'])('вырезает рантаймовый props %s', (name) => {
    // Это состояние интерфейса редактора: схемой оно не описано, и Strapi
    // ответит ошибкой валидации.
    const zone = craftToDynamicZone(craftTree({
      a: { resolvedName: 'fileManager', props: { title: 'Docs', [name]: 1 } },
    }));

    expect(zone[0]).not.toHaveProperty(name);
    expect(zone[0]).toHaveProperty('title');
  });

  it('медиа сворачивает обратно в числовой upload-id', () => {
    const zone = craftToDynamicZone(craftTree({
      a: {
        resolvedName: 'media',
        props: { images: [{ id: 3, src: '/uploads/a.png', url: '/uploads/a.png' }] },
      },
    }));

    expect(zone[0]!.images).toEqual([3]);
  });

  it('не отправляет id вложенных компонентов — Strapi v5 отвечает на них 400', () => {
    const zone = craftToDynamicZone(craftTree({
      a: {
        resolvedName: 'colorPalette',
        props: { colors: [{ id: 5, name: 'Red', formats: [{ id: 6, label: 'HEX', value: '#f00' }] }] },
      },
    }));

    const colors = zone[0]!.colors as { id?: number; formats: { id?: number }[] }[];
    expect(colors[0]).not.toHaveProperty('id');
    expect(colors[0]!.formats[0]).not.toHaveProperty('id');
    expect(colors[0]!.formats[0]).toMatchObject({ label: 'HEX', value: '#f00' });
  });

  it('пустое дерево даёт пустой Dynamic Zone', () => {
    expect(craftToDynamicZone(craftTree({}))).toEqual([]);
    expect(craftToDynamicZone({} as CraftTree)).toEqual([]);
  });
});

describe('круговой обход: Strapi → редактор → Strapi', () => {
  it('контент возвращается тем же, чем пришёл', () => {
    // Самая опасная ошибка маппера — терять поля молча. Круг это ловит.
    const palette = {
      __component: 'sections.color-palette',
      id: 2,
      title: 'П',
      size: 'big',
      colors: [{
        id: 3,
        name: 'Red',
        color: '#f00',
        formats: [{ id: 4, label: 'HEX', value: '#f00' }],
      }],
    };
    const original: DynamicZoneItem[] = [
      {
        __component: 'sections.text-block', id: 1, title: 'Т', description: 'О', body: '<p>x</p>',
      },
      palette,
      {
        __component: 'sections.divider', id: 5, spacing: 'roomy', line: true,
      },
    ];

    const back = craftToDynamicZone(dynamicZoneToCraft(original));

    expect(back).toEqual([
      {
        __component: 'sections.text-block', title: 'Т', description: 'О', body: '<p>x</p>',
      },
      {
        __component: 'sections.color-palette',
        title: 'П',
        size: 'big',
        colors: [{ name: 'Red', color: '#f00', formats: [{ label: 'HEX', value: '#f00' }] }],
      },
      {
        __component: 'sections.divider', spacing: 'roomy', line: true,
      },
    ]);
  });

  it('медиа переживает круг: объект → url+id → upload-id', () => {
    const back = craftToDynamicZone(dynamicZoneToCraft([{
      __component: 'sections.app-screenshots',
      title: 'S',
      screenshots: [{ id: 11, url: '/uploads/s.png' }],
    }]));

    expect(back[0]).toEqual({
      __component: 'sections.app-screenshots', title: 'S', screenshots: [11],
    });
  });
});
