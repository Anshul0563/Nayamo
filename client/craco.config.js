const path = require('path');

module.exports = {
  style: {
    postcss: {
      loaderOptions: {
        postcssOptions: {
          plugins: [
            require('tailwindcss'),
            require('autoprefixer'),
          ],
        },
      },
    },
  },
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
      // Disable source maps in production to fix .map loading errors
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.devtool = false;
      }
      
      return webpackConfig;
    },
  },
};
