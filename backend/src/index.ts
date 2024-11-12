import connexion from './db_connexion';
import express from 'express';
import mysql from 'mysql2/promise';
import { hashPassword, comparePassword } from './hashage';
import { generateToken, authenticateToken } from './jwt';
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

/*------------------------------------------POST---------------------------------------------- */

app.post('/POST/create-user', async (req, res) => {
    const { pseudo, nom, prenom, adresse, cp, ville, telephone, mail, mdp, role, statut, notif_mail, statut_cotisation } = req.body;

    /* vérification des champs */
    const hashedMdp = hashPassword(mdp);
    try {
        const result = await connexion.execute(
            `INSERT INTO utilisateur (pseudo, nom, prenom, adresse, cp, ville, telephone, mail, mdp, role, statut, notif_mail, statut_cotisation) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

            [pseudo, nom, prenom, adresse, cp, ville, telephone, mail, hashedMdp, role, statut, notif_mail, statut_cotisation]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id_utilisateur: (result as unknown as mysql.ResultSetHeader).insertId,
                pseudo,
                nom,
                prenom,
                adresse,
                cp,
                ville,
                telephone,
                mail,
                mdp,
                role,
                statut,
                notif_mail,
                statut_cotisation
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/*------------------------------------------PUT---------------------------------------------- */

/*------------------------------------------GET---------------------------------------------- */

app.get('/GET/connexion', async (req, res) => {
    const { mail, mdp } = req.query;

    try {
        const [rows]: any = await connexion.promise().query(`SELECT * FROM utilisateur WHERE mail = ?`, [mail]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];
        const isPasswordValid = comparePassword(mdp as string, user.mdp);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = generateToken({ id: user.id_utilisateur });
        res.status(200).json(token);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/GET/verify-token', (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token);
    
    if (!tokenVerification || !tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    res.status(200).json({ message: 'Token is valid', valid: tokenVerification.valid, userId: tokenVerification.userId });
});


/*-----------------------------------------DELETE---------------------------------------------- */
