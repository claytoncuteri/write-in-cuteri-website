// Vitest stand-in for the `server-only` package. The real module throws
// on import outside a React Server Component so that server code never
// ends up in a client bundle. Under vitest there is no bundle, so an
// empty module is the correct substitute.
export {};
