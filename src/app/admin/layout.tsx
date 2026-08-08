import type { ReactNode } from 'react';

// /admin — СОБСТВЕННЫЙ роут этого Next.js-приложения (craft.js-редактор
// гайдлайнов), НЕ Strapi admin panel (§4). Доступ уже проверен в
// src/middleware.ts (роль admin); здесь только UI-обвязка редактора.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-shell">{children}</div>;
}
