import axios from 'axios';
import appConfig from '@/config/app';
import {SmsRequest} from "@/types/response.type";

const encodedToken = Buffer.from(`${appConfig.sms.bulkSmsApiTokenId}:${appConfig.sms.bulkSmsApiToken}`).toString('base64');

const sendSms = async ({ to, message }: SmsRequest) => {
    try {
        const response = await axios.post(
            appConfig.sms.bulkSmsUrl,
            {
                to,
                body: message
            },
            {
                headers: {
                    Authorization: `Basic ${encodedToken}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        console.log('SMS response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw new Error('Failed to send SMS');
    }
};

export default {
    sendSms
};