const path = require('path');

// https://github.com/ai/browserslist#queries
const SUPPORTED_BROWSERS = require('./package.json').browserslist;
const DOIUSE_IGNORE = [
  'flexbox',
  'font-unicode-range',
  'css3-cursors',
  'css3-cursors-newer',
];

module.exports = {
  syntax: require('postcss-scss'),
  plugins: [
    // https://github.com/luisrudge/postcss-flexbugs-fixes
    // require('postcss-flexbugs-fixes'),
    require('postcss-partial-import')({
      path: [
        path.resolve(__dirname, 'src/styles/'), // to get the common styles..
      ],
      root: process.cwd(),
      extension: '.scss',
    }),
    // https://github.com/mummybot/postcss-strip-inline-comments
    require('postcss-strip-inline-comments')(),
    // https://github.com/jonathantneal/precss
    //
    // precss consists of many other plugins
    // see the list of plugins https://github.com/jonathantneal/precss#plugins
    require('precss')({
      import: false, // because postcss-partial-import is not up to date in precss: https://github.com/jonathantneal/precss/issues/83
    }),
    // https://github.com/postcss/autoprefixer
    require('autoprefixer')({
      browsers: SUPPORTED_BROWSERS,
    }),
    // https://github.com/anandthakker/doiuse
    require('doiuse')({
      browsers: SUPPORTED_BROWSERS,
      ignore: DOIUSE_IGNORE,
      ignoreFiles: [
        // an optional array of file globs to match against original source file path, to ignore
        '**/react-select.css'
      ],
    })
  ]
}
