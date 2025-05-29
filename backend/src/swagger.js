const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UNION API Documentation',
      version: '1.0.0',
      description: 'UNIONのバックエンドAPIドキュメント',
      contact: {
        name: 'UNION Support',
        email: 'support@union.example.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: '開発サーバー'
      },
      {
        url: process.env.PRODUCTION_API_URL || 'https://api.union.example.com',
        description: '本番サーバー'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'エラーメッセージ'
            },
            error: {
              type: 'string',
              example: null
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              example: 1
            },
            totalPages: {
              type: 'integer',
              example: 10
            },
            totalItems: {
              type: 'integer',
              example: 100
            },
            itemsPerPage: {
              type: 'integer',
              example: 10
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'UNION API Documentation'
  })
}; 