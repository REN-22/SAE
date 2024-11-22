import crypto from 'crypto';
const salt = 'Flugabwehrraketensystem Roland auf Radkraftfahrzeug';

function hashPassword(mdp: any) {
  const hashedPassword = crypto.pbkdf2Sync(mdp, salt, 1000, 64, 'sha512').toString('hex');
  return hashedPassword;
}


function comparePassword(mdp: string, hash: string): boolean {
  const hashedPassword = crypto.pbkdf2Sync(mdp, salt, 1000, 64, 'sha512').toString('hex');
  return hashedPassword === hash;
}

export { hashPassword, comparePassword };