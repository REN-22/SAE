import jwt from 'jsonwebtoken';

const secretKey = '8.8cm_Flak_37_Selbstfahrlafette_auf_18_ton_Zugkraftwagen';

// Fonction pour générer un jeton JWT
export const generateToken = (user: { id: number}) => {
  return jwt.sign(user, secretKey, { expiresIn: '1h' });
};

// Middleware pour vérifier le jeton JWT
export const authenticateToken = (token : any) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return { valid: true, userId: (decoded as any).id };
  } catch (err) {
    return { valid: false, userId: null };
  }
};
