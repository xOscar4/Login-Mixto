export type FieldErrors = Record<string, string>;

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function passwordChecks(value: string) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };
}

export function passwordStrength(value: string) {
  const checks = passwordChecks(value);
  return Object.values(checks).filter(Boolean).length;
}

export function validateLogin(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = 'Ingresa tu correo.';
  } else if (!isEmail(email)) {
    errors.email = 'El correo no tiene un formato válido.';
  }

  if (!password) {
    errors.password = 'Ingresa tu contraseña.';
  } else if (password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres.';
  }

  return errors;
}

export function validateRegister(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!name.trim()) {
    errors.name = 'Ingresa tu nombre.';
  } else if (name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres.';
  }

  if (!email.trim()) {
    errors.email = 'Ingresa tu correo.';
  } else if (!isEmail(email)) {
    errors.email = 'El correo no tiene un formato válido.';
  }

  const checks = passwordChecks(password);
  if (!password) {
    errors.password = 'Crea una contraseña.';
  } else if (!checks.length || !checks.upper || !checks.lower || !checks.number) {
    errors.password = 'Usa 8 caracteres o más, mayúscula, minúscula y número.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  return errors;
}

export function validateForgot(email: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = 'Ingresa tu correo.';
  } else if (!isEmail(email)) {
    errors.email = 'El correo no tiene un formato válido.';
  }

  return errors;
}

export function validateCollection(name: string, description: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!name.trim()) {
    errors.name = 'El nombre de la colección es obligatorio.';
  } else if (name.trim().length > 80) {
    errors.name = 'Usa 80 caracteres o menos.';
  }

  if (description.trim().length > 280) {
    errors.description = 'La descripción debe tener 280 caracteres o menos.';
  }

  return errors;
}

export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!currentPassword) {
    errors.currentPassword = 'Ingresa tu contraseña actual.';
  }

  const checks = passwordChecks(newPassword);
  if (!newPassword) {
    errors.newPassword = 'Ingresa una nueva contraseña.';
  } else if (!checks.length || !checks.upper || !checks.lower || !checks.number) {
    errors.newPassword = 'Usa 8 caracteres o más, mayúscula, minúscula y número.';
  } else if (newPassword === currentPassword) {
    errors.newPassword = 'La nueva contraseña debe ser diferente.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirma la nueva contraseña.';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  return errors;
}

export function hasErrors(errors: FieldErrors) {
  return Object.keys(errors).length > 0;
}
