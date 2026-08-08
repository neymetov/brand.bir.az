// Next.js генерирует эти объявления в next-env.d.ts при первом `next dev`/
// `next build`. Продублировано вручную, чтобы `tsc --noEmit` (CI/typecheck
// без сборки) не падал раньше первого запуска Next.js.
declare module '*.module.scss' {
  const classes: { readonly [className: string]: string };
  export default classes;
}
