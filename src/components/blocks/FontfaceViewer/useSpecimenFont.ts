'use client';

import { useEffect, useState } from 'react';
import { cssFamilyName, type FontSpecimen } from './types';

export type FontStatus = 'idle' | 'loading' | 'ready' | 'failed';

/**
 * Подгружает файл шрифта из CMS и регистрирует его в документе.
 *
 * Через FontFace API, а не подстановкой @font-face в CSS: правило пришлось
 * бы собирать строкой из URL, пришедшего из CMS, и вставлять в стили —
 * то есть впускать внешние данные в CSS. FontFace принимает URL как
 * значение, а не как код, и честно сообщает об ошибке загрузки, так что
 * несуществующий файл виден сразу, а не молча подменяется системным шрифтом.
 */
export function useSpecimenFont(specimen: FontSpecimen): FontStatus {
  const [status, setStatus] = useState<FontStatus>('idle');
  const family = cssFamilyName(specimen);
  const { fontUrl, weight } = specimen;

  useEffect(() => {
    if (!family || !fontUrl) {
      setStatus('idle');
      return undefined;
    }

    // Тот же файл мог быть зарегистрирован другой строкой витрины —
    // повторная загрузка не нужна.
    const alreadyLoaded = Array.from(document.fonts).some(
      (font) => font.family === family,
    );
    if (alreadyLoaded) {
      setStatus('ready');
      return undefined;
    }

    let cancelled = false;
    setStatus('loading');

    const fontFace = new FontFace(family, `url(${JSON.stringify(fontUrl)})`, {
      weight: weight ? String(weight) : 'normal',
    });

    fontFace
      .load()
      .then((loaded) => {
        if (cancelled) return;
        document.fonts.add(loaded);
        setStatus('ready');
      })
      .catch(() => {
        // Битая ссылка/протухший presigned URL/неподдерживаемый формат —
        // всё это сюда. Блок покажет образец системным шрифтом и пометит
        // строку, чтобы редактор увидел проблему.
        if (!cancelled) setStatus('failed');
      });

    return () => {
      cancelled = true;
    };
  }, [family, fontUrl, weight]);

  return status;
}
