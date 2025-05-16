import swaggerJsdoc from 'swagger-jsdoc';
import appConfig from '@/config/app';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Asset management',
            version: '1.0.0',
            description: 'API documentation for Asset management',
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
            contact: {
                name: 'API Support',
                email: 'support@yourapp.com',
            },
        },
        servers: [
            {
                url: `${appConfig.appUrl}${appConfig.apiPrefix}`,
                description: 'API Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/controller/*.ts',
        './src/models/*.ts',
        './src/validations/*.ts',
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;