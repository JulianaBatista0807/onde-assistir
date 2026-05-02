const path = require('node:path');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

function registerSwagger(app) {
  const swaggerPath = path.join(__dirname, '..', 'swagger.yaml');
  const spec = YAML.load(swaggerPath);

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
  app.get('/docs.json', (_req, res) => res.json(spec));
}

module.exports = { registerSwagger };

