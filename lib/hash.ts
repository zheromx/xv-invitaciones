import bcrypt from "bcryptjs";

export function hashContrasena(
  contrasenaPlana: string,
  rondas = 10
): Promise<string> {
  return bcrypt.hash(contrasenaPlana, rondas);
}

export function verificarContrasena(
  contrasenaPlana: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(contrasenaPlana, hash);
}