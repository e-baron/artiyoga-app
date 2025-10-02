
let development: boolean | null = null;

const isDev = (): boolean | null => {
  if (development === null) {
    development =
      process.env.NODE_ENV === "development" || process.env.FORCE_DEV === "1";
  }
  return development;
};

export { isDev };
