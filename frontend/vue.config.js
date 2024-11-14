const webpack = require('webpack');

const ignoreCliPlugin = new webpack.IgnorePlugin({
  resourceRegExp: /.\/cli$/,
  contextRegExp: /@jovotech[/\\]platform-\w+[/\\]dist[/\\]\w+$/,
});

const externals = {
  '@jest/globals': 'var {}',
  'axios': 'var {}',
  'google-auth-library': 'var { JWT: function JWT() {} }',
  'i18next': 'var {}',
  'json-colorizer': 'var () => {}',
  'lodash.clonedeep': 'var () => {}',
  'lodash.unset': 'var () => {}',
  './GoogleAssistantRepromptComponent': 'var {}',
  './JovoLogger': 'var { JovoLogger: function JovoLogger() {} }',
};

const plugins = [ignoreCliPlugin];
if (process.env.NODE_ENV === 'production') {
  externals['./JovoProxy'] = 'var { JovoProxy: function JovoProxy() {} }';
  externals['./BaseComponent'] = 'var { BaseComponent: function BaseComponent() {} }';
  externals['./BaseOutput'] = 'var { BaseOutput: function BaseOutput() {} }';

}

module.exports = {
  publicPath: './',
  chainWebpack: (config) => {
    config.resolve.symlinks(false);
  },
  transpileDependencies: ['@jovotech/client-web-vue2'],
  configureWebpack: {
    plugins,
    externals,
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('postcss-import'),
          require('tailwindcss'),
          require('postcss-nested'),
          require('postcss-custom-properties'),
          require('autoprefixer'),
        ],
      },
    },
  },
};
