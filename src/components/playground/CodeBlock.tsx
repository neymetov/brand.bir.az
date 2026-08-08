'use client';

import { useState } from 'react';

// Подсветка делается на сборке (shiki, см. getComponentSource.ts) — сюда
// приходит уже готовый HTML. Кнопка "копировать" — navigator.clipboard (§3.3).
interface CodeBlockProps {
  /** Готовый HTML от shiki, посчитанный на сборке */
  highlightedHtml: string;
  raw: string;
}

export function CodeBlock({ highlightedHtml, raw }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="code-block">
      <button type="button" onClick={handleCopy} className="code-block__copy">
        {copied ? 'Скопировано' : 'Копировать'}
      </button>
      {/* eslint-disable-next-line react/no-danger, risxss/catch-potential-xss-react --
          shiki-вывод build-time, из своего же репозитория ДС, не CMS/пользовательский ввод */}
      <div className="code-block__content" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
    </div>
  );
}
