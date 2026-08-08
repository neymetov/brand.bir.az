'use client';

import { useEffect } from 'react';
import { useForm, type DefaultValues } from 'react-hook-form';

// Состояние props НЕЗАВИСИМО от состояния бренда (§3.3) — отдельный form
// state, оба скоуплены на конкретный демо-блок, но не связаны друг с другом.
interface PropsPanelProps<TProps extends Record<string, unknown>> {
  readonly defaultValues: TProps;
  readonly onChange: (values: TProps) => void;
}

export function PropsPanel<TProps extends Record<string, unknown>>({
  defaultValues,
  onChange,
}: PropsPanelProps<TProps>) {
  // react-hook-form типизирует defaultValues через DefaultValues<TProps>
  // (глубокий mapped-тип) — с общим `TProps extends Record<string, unknown>`
  // TS не может доказать совместимость сам, приходится подсказать явно.
  const { register, watch } = useForm<TProps>({
    defaultValues: defaultValues as DefaultValues<TProps>,
  });

  // Заглушка формы с полями по ключам defaultValues — генерация полей из
  // реальной пропсов-схемы компонента ДС ещё не реализована.
  const values = watch();

  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  return (
    <form className="props-panel">
      {Object.keys(defaultValues).map((key) => (
        <label key={key} htmlFor={key} className="props-panel__field">
          <span>{key}</span>
          {/* eslint-disable-next-line react/jsx-props-no-spreading --
              register() из react-hook-form требует спреда (ref/onChange/onBlur/name) */}
          <input id={key} {...register(key as never)} />
        </label>
      ))}
    </form>
  );
}
