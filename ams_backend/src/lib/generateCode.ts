import crypto from 'crypto'

export const generateCode = (length: number = 4) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(crypto.randomInt(0, 10))];
    }
    return OTP;
};

export const generateInvoiceFormat = (counter:number) => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const sequence = String(counter).padStart(6, '0');

    return `INV-${day}${month}${year}-${sequence}`;
};

