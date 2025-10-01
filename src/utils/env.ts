
let development: boolean | null = null;

const isDev = (): boolean | null => {
  console.log(
    "initDev called with environment variable NODE_ENV =",
    process.env.NODE_ENV,
    "and FORCE_DEV =",
    process.env.FORCE_DEV
  );
  if (development === null) {
    development =
      process.env.NODE_ENV === "development" || process.env.FORCE_DEV === "1";
  }
  console.log("isDev called, development =", development);
  return development;
};

export { isDev };
