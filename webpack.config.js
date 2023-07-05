const Path = require('path');
const webpack = require('webpack');
const rootDir = Path.resolve();

const config = [
  {
    name: 'js',
    entry: {
        'ReportLoader': rootDir + '/js-src/ReportLoader.jsx'
    },
    output: {
      path: rootDir,
      filename: 'javascript/[name].js',
      devtoolModuleFilenameTemplate: '[resource-path]',
      devtoolFallbackModuleFilenameTemplate: '[resource-path]'
    },
    devtool: 'nosources-source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/env', { modules: false }],
                            '@babel/react',
                        ],
                        comments: false
                    }
                }
            }
        ]
    },
    externals: {
            'apollo-client': 'ApolloClient',
            'bootstrap-collapse': 'BootstrapCollapse',
            classnames: 'classnames',
            'deep-freeze-strict': 'DeepFreezeStrict',
            'graphql-fragments': 'GraphQLFragments',
            'graphql-tag': 'GraphQLTag',
            history: 'history',
            'isomorphic-fetch': 'IsomorphicFetch',
            i18n: 'i18n',
            jquery: 'jQuery',
            merge: 'merge',
            'page.js': 'Page',
            'react-addons-test-utils': 'ReactAddonsTestUtils',
            'react-dom': 'ReactDom',
            poppers: 'Poppers',
            reactstrap: 'Reactstrap',
            'react-apollo': 'ReactApollo',
            'react-redux': 'ReactRedux',
            'react-router-redux': 'ReactRouterRedux',
            'react-router': 'ReactRouter',
            'react-select': 'ReactSelect',
            'react-addons-css-transition-group': 'ReactAddonsCssTransitionGroup',
            react: 'React',
            'redux-form': 'ReduxForm',
            'redux-thunk': 'ReduxThunk',
            redux: 'Redux',
            config: 'Config',
            qs: 'qs',
            moment: 'moment',
            modernizr: 'modernizr',
            'react-dnd': 'ReactDND',
            'react-dnd-html5-backend': 'ReactDNDHtml5Backend',
            validator: 'validator',
            'prop-types': 'PropTypes',
            'components/Loading/Loading': 'Loading',
        }
    },
];

// Use WEBPACK_CHILD=js or WEBPACK_CHILD=css env var to run a single config
module.exports = (process.env.WEBPACK_CHILD ? config.find((entry) => entry.name === process.env.WEBPACK_CHILD):module.exports = config);
