import connexion from './db_connexion';
import express from 'express';
import mysql from 'mysql2/promise';
import { hashPassword, comparePassword } from './hashage';
import { generateToken, authenticateToken, getUserIdFromToken } from './jwt';
const cors = require('cors');
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Configuration avancée de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });



/*------------------------------------------POST---------------------------------------------- */

// Création d'un utilisateur
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

// Upload d'une photo avec fichiers et création d'une version de moindre qualité
app.post('/POST/upload-photo', upload.fields([{ name: 'exif', maxCount: 1 }, { name: 'photo', maxCount: 1 }]), async (req, res) => {
    if (!req.files || !('photo' in req.files)) {
        return res.status(400).json({ message: 'No photo file uploaded' });
    }

    const info = JSON.parse(req.body.info);
    const { nom, nomphoto, description, isPublic, photographe } = info;
    const token = req.body.token;

    const tokenVerification = authenticateToken(token);
    const date_depot = new Date();

    const userId = getUserIdFromToken(req.body.token);

    let exif;
    if (!req.files['exif']) {
        exif = 'intégré';
    } else {
        exif = req.files['exif'][0].path;
    }
    try {
        const [result] = await connexion.promise().execute(
            `INSERT INTO photo (nom, date_depot, exif, isPublic, id_utilisateur, id_utilisateur_1, légende) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nom, date_depot, exif, isPublic, userId, photographe, description]
        );

        const photoId = (result as unknown as mysql.ResultSetHeader).insertId;

        // Move files to their respective directories
        const photoFile = req.files['photo'][0];

        // Vérification de l'existence des fichiers
        if (!fs.existsSync(photoFile.path)) {
            return res.status(500).json({ message: 'Temporary file not found' });
        }

        const photoFilePath = path.join(__dirname, 'photo', `${photoId}-${photoFile.originalname}`);
        const minPhotoFilePath = path.join(__dirname, 'minphoto', `${photoId}-${photoFile.originalname}`);

        await fs.promises.mkdir(path.dirname(photoFilePath), { recursive: true });
        await fs.promises.rename(photoFile.path, photoFilePath);

        // Create a lower quality version of the photo
        await fs.promises.mkdir(path.dirname(minPhotoFilePath), { recursive: true });
        await sharp(photoFilePath)
            .resize(800) // Resize to 800px width, keeping aspect ratio
            .toFile(minPhotoFilePath);

        if (req.files['exif']) {
            const exifFile = req.files['exif'][0];
            const exifFilePath = path.join(__dirname, 'exif', `${photoId}.exif`);

            await fs.promises.mkdir(path.dirname(exifFilePath), { recursive: true });
            await fs.promises.rename(exifFile.path, exifFilePath);
        }

        res.status(201).json({
            message: 'Photo uploaded successfully',
            photo: {
                id_photo: photoId,
                nom,
                date_depot,
                exif: req.files['exif'] ? req.files['exif'][0].path : null,
                nomphoto,
                description,
                isPublic,
                id_utilisateur: tokenVerification.userId,
                photographe,
                photoFilePath,
                minPhotoFilePath
            }
        });
    } catch (error) {
        // Nettoyage des fichiers téléchargés en cas d'erreur
        if (req.files['photo']?.[0]?.path) await fs.promises.unlink(req.files['photo'][0].path).catch(console.error);
        if (req.files['exif']?.[0]?.path) await fs.promises.unlink(req.files['exif'][0].path).catch(console.error);
    
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


/*------------------------------------------PUT---------------------------------------------- */

/*------------------------------------------GET---------------------------------------------- */

// Connexion d'un utilisateur
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

// Vérification d'un token
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

// récupération liste des utilisateurs
app.get('/GET/users', async (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token);
    
    if (!tokenVerification || !tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = getUserIdFromToken(token);

    try {
        const [rows]: any = await connexion.promise().query(`SELECT * FROM utilisateur`);
        const sortedRows = rows.sort((a: any, b: any) => (a.id_utilisateur === userId ? -1 : 1));
        console.log('sortedRows', sortedRows);
        res.status(200).json(sortedRows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


/*-----------------------------------------DELETE---------------------------------------------- */
