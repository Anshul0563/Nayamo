const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Exclude lucide-react and other ESM libs from source-map-loader
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOfRule) => {
            if (oneOfRule.use && Array.isArray(oneOfRule.use)) {
              oneOfRule.use.forEach((use) => {
                if (use.loader && use.loader.includes('source-map-loader')) {
                  use.options = {
                    ...use.options,
                    exclude: [
                      /node_modules\/lucide-react/,
                      /node_modules\/date-fns/
                    ],
                  };
                }
              });
            }
          });
        }
      });
      return webpackConfig;
    },
  },
  style: {
    postcss: {
      plugins: [
        require('tailwindcss')(path.resolve(__dirname, 'tailwind.config.js')),
        require('autoprefixer'),
      ],
    },
  },
};
