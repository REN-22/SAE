import connexion from './db_connexion';
import express from 'express';
import mysql from 'mysql2/promise';
import { hashPassword,comparePassword } from './hashage';

const app = express();
const port = 5000;


app.use(express.json());


/*------------------------------------------POST---------------------------------------------- */

app.post('/POST/create-user', async (req, res) => {
    const { pseudo, nom, prenom, adresse, cp, ville, telephone, mail, mdp, role, statut, notif_mail, statut_cotisation } = req.body;
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

/*------------------------------------------GET---------------------------------------------- */








/*-----------------------------------------DELETE---------------------------------------------- */

