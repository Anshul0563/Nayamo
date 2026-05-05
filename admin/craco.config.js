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
      // Existing date-fns fix
      webpackConfig.module.rules.forEach((rule, ruleIndex) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOfRule, oneOfIndex) => {
            if (oneOfRule.use && Array.isArray(oneOfRule.use)) {
              oneOfRule.use.forEach((use, useIndex) => {
                if (use.loader && use.loader.includes('source-map-loader')) {
                  webpackConfig.module.rules[ruleIndex].oneOf[oneOfIndex].use[useIndex].options = {
                    ...use.options,
                    exclude: [/node_modules\/date-fns/, /node_modules\/react/],
                  };
                }
              });
            }
          });
        }
      });

      // Optimize React chunks
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.devtool = false;
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react-vendor',
                chunks: 'all',
                priority: 20,
              },
            },
          },
        };
        // Node polyfills for Vercel
        webpackConfig.resolve.fallback = {
          ...webpackConfig.resolve.fallback,
          fs: false,
          path: false,
          crypto: false,
        };
      }
      
      return webpackConfig;
    },
  },
};
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
      // Disable source maps in production to fix .map loading errors
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.devtool = false;
      }
      
      return webpackConfig;
    },
  },
};
