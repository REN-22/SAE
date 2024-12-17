import jwt from 'jsonwebtoken';
import connexion from './db_connexion';

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
// Fonction pour obtenir l'ID de l'utilisateur à partir du jeton JWT
export const getUserIdFromToken = (token: any) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return (decoded as any).id;
  } catch (err) {
    return null;
  }
};

export const getRoleFromId = (id: number) => {
  return new Promise<string>((resolve, reject) => {
    connexion.query('SELECT role FROM Utilisateur WHERE id_utilisateur = ?', [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve((results as { role: string }[])[0].role);
      }
    });
  });
}