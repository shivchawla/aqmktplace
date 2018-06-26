// const { injectBabelPlugin } = require('react-app-rewired');
// const rewireLess = require('react-app-rewire-less');

// module.exports = function override(config, env) {
//   config = injectBabelPlugin(['import', { libraryName: 'antd', style: true }], config); 
//   config = rewireLess.withLoaderOptions({
//     modifyVars: 
//       { "@primary-color": "#03A7AD",
//   			"@font-family": "Lato" },
//       }
//   )(config, env);
//   return config;
// };

const { injectBabelPlugin } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');
const rewireBabelLoader = require("react-app-rewire-babel-loader");

const path = require("path");
const fs = require("fs");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);


module.exports = function override(config, env) {
  config = injectBabelPlugin(['import', { libraryName: 'antd', style: true }], config); 
  config = rewireLess.withLoaderOptions({
  	modifyVars: { 
      "@primary-color": "#03A7AD",
      "@brand-primary": "#1DA57A",
      "@font-family": "Lato" 
    },
  })(config, env);
  config = rewireBabelLoader.include(
    config,
    resolveApp("node_modules/ace-diff")
  );
  return config;
};

