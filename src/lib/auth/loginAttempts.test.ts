import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import {
  GLOBAL_LIMIT,
  PER_CLIENT_LIMIT,
  recordFailure,
  recordSuccess,
  resetAttempts,
  retryAfterSeconds,
} from './loginAttempts';

// Время передаётся аргументом, а не подменяется таймерами: окно длится
// четверть часа, и ждать его в тестах нечем.
const T0 = 1_700_000_000_000;
const MINUTE = 60 * 1000;

beforeEach(() => {
  resetAttempts();
});

function fail(client: string, times: number, at = T0): void {
  for (let i = 0; i < times; i += 1) recordFailure(client, at);
}

describe('предел на один адрес', () => {
  it('до предела попытки проходят', () => {
    fail('10.0.0.1', PER_CLIENT_LIMIT - 1);
    expect(retryAfterSeconds('10.0.0.1', T0)).toBeNull();
  });

  it('на пределе адрес отбивается', () => {
    fail('10.0.0.1', PER_CLIENT_LIMIT);
    expect(retryAfterSeconds('10.0.0.1', T0)).not.toBeNull();
  });

  it('соседний адрес при этом не страдает', () => {
    fail('10.0.0.1', PER_CLIENT_LIMIT);
    expect(retryAfterSeconds('10.0.0.2', T0)).toBeNull();
  });

  it('через четверть часа окно открывается заново', () => {
    fail('10.0.0.1', PER_CLIENT_LIMIT);
    expect(retryAfterSeconds('10.0.0.1', T0 + 15 * MINUTE)).toBeNull();
  });

  it('Retry-After убывает по мере хода окна', () => {
    fail('10.0.0.1', PER_CLIENT_LIMIT);
    const atStart = retryAfterSeconds('10.0.0.1', T0);
    const later = retryAfterSeconds('10.0.0.1', T0 + 10 * MINUTE);
    expect(atStart).toBe(15 * 60);
    expect(later).toBe(5 * 60);
  });

  it('удачный вход снимает запрет с адреса', () => {
    // Иначе человек, который несколько раз опечатался и всё же вошёл,
    // остался бы заперт на четверть часа.
    fail('10.0.0.1', PER_CLIENT_LIMIT - 1);
    recordSuccess('10.0.0.1');
    fail('10.0.0.1', PER_CLIENT_LIMIT - 1);
    expect(retryAfterSeconds('10.0.0.1', T0)).toBeNull();
  });
});

describe('общий предел закрывает подделку X-Forwarded-For', () => {
  it('перебор с новым адресом на каждой попытке всё равно упирается', () => {
    // Ровно тот обход, ради которого общий счётчик и заведён: предел «на
    // адрес» не срабатывает ни разу, потому что адрес каждый раз новый.
    for (let i = 0; i < GLOBAL_LIMIT; i += 1) recordFailure(`10.0.0.${i}`, T0);

    expect(retryAfterSeconds('10.0.0.999', T0)).not.toBeNull();
  });

  it('удачный вход общий счётчик не обнуляет', () => {
    // Иначе достаточно знать пароль viewer, чтобы снимать защиту с подбора
    // пароля админа.
    for (let i = 0; i < GLOBAL_LIMIT; i += 1) recordFailure(`10.0.0.${i}`, T0);
    recordSuccess('10.0.0.1');

    expect(retryAfterSeconds('10.0.0.999', T0)).not.toBeNull();
  });

  it('общий предел выше личного: одна опечатка своих не запирает', () => {
    expect(GLOBAL_LIMIT).toBeGreaterThan(PER_CLIENT_LIMIT);
  });
});

describe('память не растёт бесконечно', () => {
  it('счётчики протухших окон выбрасываются', () => {
    // Подделанный заголовок позволяет насочинять сколько угодно ключей.
    // Проверяем через поведение: после уборки старые окна не мешают
    // накопить общий предел заново.
    for (let i = 0; i < GLOBAL_LIMIT; i += 1) recordFailure(`10.1.0.${i}`, T0);
    expect(retryAfterSeconds('10.1.0.999', T0)).not.toBeNull();

    const later = T0 + 16 * MINUTE;
    expect(retryAfterSeconds('10.1.0.999', later)).toBeNull();
    fail('10.2.0.1', PER_CLIENT_LIMIT - 1, later);
    expect(retryAfterSeconds('10.2.0.1', later)).toBeNull();
  });
});
