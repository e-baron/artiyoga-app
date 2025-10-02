const isDev = (): boolean => process.env.NEXT_PUBLIC_NODE_ENV !== "production";

export { isDev };
