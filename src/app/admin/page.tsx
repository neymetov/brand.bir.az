import { BlockEditorClient } from '@/components/admin/BlockEditorClient';

// Визуальный редактор гайд-страниц на craft.js (§3.5). Обмен со Strapi
// (GET → Dynamic Zone → узлы craft.js при открытии, query.serialize() → PUT
// при сохранении) ещё не подключён — сейчас редактор работает на локальном
// состоянии браузера, чтобы проверять блоки по мере их появления.
export default function AdminEditorPage() {
  return <BlockEditorClient />;
}
