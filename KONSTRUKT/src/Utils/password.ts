const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).+$/;

export const PASSWORD_HELP =
  'Au moins 8 caractères, avec une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&#).';

export const isValidPassword = (value: string): boolean => value.length >= 8 && PASSWORD_RULE.test(value);
