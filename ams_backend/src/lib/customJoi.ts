import Joi, {CustomHelpers} from 'joi';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

type PrismaModels = keyof typeof prisma;

const existsInDatabase: Joi.ExtensionFactory = (joi: Joi.Root) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.notFound': '{{#label}} with value {{#value}} does not exist in {{#model}}',
        'string.invalid': '{{#label}} must be a valid ObjectId'
    },
    rules: {
        exists: {
            args: [
                {
                    name: 'model',
                    ref: true,
                    assert: (value) => typeof value === 'string',
                    message: 'must be a string',
                },
                {
                    name: 'field',
                    ref: true,
                    assert: (value) => typeof value === 'string',
                    message: 'must be a string',
                },
            ],

            method(this: any, model: string, field: string) {
                return this.$_addRule({ name: 'exists', args: { model, field: field } });
            },
            async validate(value: any, helpers: CustomHelpers, args: { model: string; field: string }) {
                const { model, field } = args;
                if(!objectIdPattern.test(value)){
                    return helpers.error('string.invalid');
                }
                const existsInDatabase = await checkIdExistsInDatabase(model, field, value);
                if (!existsInDatabase) {
                    return helpers.error('string.invalid', { model, field });
                }
                return value;
            }
        }
    }
});

async function checkIdExistsInDatabase(model: string, field: string, value: any) {

    try {
        if (!value || !model || !field){
            return false;
        }
        const result = await (prisma[model as PrismaModels] as any).findFirst({
            where: {
                [field]: value
            }
        });
        return !!result;
    } catch (error) {
        // console.log(error);
        return false;
    }
}

const customJoi = Joi.extend(existsInDatabase);

export default customJoi;

