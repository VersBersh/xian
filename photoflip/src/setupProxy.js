const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(createProxyMiddleware('/randydiary',
          {
            target: 'https://c-hasselbusch.de',
            changeOrigin: true,
            secure: false,
            onProxyReq: function(proxyReq) {
              proxyReq.setHeader("origin", "https://c-hasselbusch.de");
            },
          }));
};