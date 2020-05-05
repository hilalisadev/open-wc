module.exports = {
  nodeResolve: true,
  open: './_site-dev',
  responseTransformers: [
    function rewriteBasePath({ contentType, body }) {
      if (contentType.includes('text/html')) {
        return {
          body: body.replace(/<base href=".*">/, '<base href="/_site-dev/">'),
        };
      }
      return null;
    },
  ],
};
