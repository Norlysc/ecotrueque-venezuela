module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { web: { unstable_transformImportMeta: true } }]],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@stores': './src/stores',
            '@services': './src/services',
            '@constants': './src/constants',
            '@utils': './src/utils',
            '@lib': './src/lib',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
