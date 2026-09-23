export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Минимум 8 знаков");
  }

  if (!/[A-ZА-Я]/.test(password)) {
    errors.push("Заглавная буква");
  }

  if (!/[#!$%&^*_+|=?,.\/\\]/.test(password)) {
    errors.push("Специальный символ (- # ! $ % ^ & * _ + | = ? , . / \\)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
