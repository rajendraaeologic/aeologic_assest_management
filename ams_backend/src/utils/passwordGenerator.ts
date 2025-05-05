import generatePassword from "generate-password";

export const generateRandomPassword = (): string => {
  return generatePassword.generate({
    length: 8,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
    strict: true,
  });
};
