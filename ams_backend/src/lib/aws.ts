import { SESClient } from '@aws-sdk/client-ses';
import appConfig from '@/config/app'

export const sesClient = new SESClient({
    credentials: appConfig.aws.credentials,
    region: appConfig.aws.region
})
