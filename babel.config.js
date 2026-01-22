module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "zod/v4/core": "./src/shims/zod-shim",
            zod: "./src/shims/zod-shim",
          },
        },
      ],
    ],
  };
};
