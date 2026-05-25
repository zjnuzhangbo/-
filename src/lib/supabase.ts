import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-project-url');

function noopPromise<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Chainable = any;

function buildNoopQueryBuilder() {
  const builder: Record<string, unknown> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chainable: Chainable = new Proxy(() => {}, {
    get(_t: unknown, _p: unknown) {
      return chainable;
    },
    apply(_t: unknown, _a: unknown, _args: unknown[]) {
      return chainable;
    },
  });

  const promiseMethods = ['then', 'catch', 'finally'];
  const dbMethods: Record<string, () => unknown> = {
    select: () => chainable,
    insert: () => chainable,
    update: () => chainable,
    delete: () => chainable,
    upsert: () => chainable,
    eq: () => chainable,
    neq: () => chainable,
    gt: () => chainable,
    lt: () => chainable,
    gte: () => chainable,
    lte: () => chainable,
    order: () => chainable,
    limit: () => chainable,
    range: () => chainable,
    single: () => noopPromise({ data: null, error: null }),
    maybeSingle: () => noopPromise({ data: null, error: null }),
  };

  for (const [name, fn] of Object.entries(dbMethods)) {
    builder[name] = name === 'single' || name === 'maybeSingle' ? fn : (..._args: unknown[]) => chainable;
  }

  // Attach .then/.catch/.finally so the chain resolves as Promise<{data:[],error:null}>
  const proxy = new Proxy(
    {},
    {
      get(_, prop) {
        if (typeof prop === 'string' && promiseMethods.includes(prop)) {
          if (prop === 'then') {
            return (resolve: (v: unknown) => unknown) => {
              resolve({ data: [], error: null });
              return proxy;
            };
          }
          if (prop === 'catch') {
            return () => proxy;
          }
          if (prop === 'finally') {
            return (cb: () => unknown) => {
              cb();
              return proxy;
            };
          }
        }
        const method = builder[prop as string];
        if (method !== undefined) return method;
        // Unknown property → return chainable
        return (..._args: unknown[]) => proxy;
      },
    }
  );

  return proxy;
}

function createNoopClient() {
  const qb = buildNoopQueryBuilder();

  return {
    from: () => qb,
    auth: {
      getSession: () => noopPromise({ data: { session: null }, error: null }),
      signInWithPassword: () =>
        noopPromise({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      signOut: () => noopPromise({ error: null }),
      updateUser: () => noopPromise({ data: { user: null }, error: null }),
      onAuthStateChange: () => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    storage: {
      from: () => ({
        upload: () => noopPromise({ data: { path: '' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: () => noopPromise({ error: null }),
      }),
    },
  } as unknown as ReturnType<typeof createClient>;
}

export const supabase = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createNoopClient();

export { isConfigured };
