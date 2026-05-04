const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Exclude date-fns from source-map-loader (CRA 5 issue with ESM)
      webpackConfig.module.rules.forEach((rule, ruleIndex) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOfRule, oneOfIndex) => {
            if (oneOfRule.use && Array.isArray(oneOfRule.use)) {
              oneOfRule.use.forEach((use, useIndex) => {
                if (use.loader && use.loader.includes('source-map-loader')) {
                  webpackConfig.module.rules[ruleIndex].oneOf[oneOfIndex].use[useIndex].options = {
                    ...use.options,
                    exclude: [/node_modules\/date-fns/],
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
