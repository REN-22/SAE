import connexion from './db_connexion';
import express, { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { hashPassword, comparePassword } from './hashage';
import { generateToken, authenticateToken, getUserIdFromToken } from './jwt';
const cors = require('cors');
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { console } from 'inspector';
import {ExifParserFactory} from "ts-exif-parser";

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
    const { pseudo, nom, prenom, adresse, cp, ville, telephone, mail, mdp, notif_mail} = req.body;

    /* vérification des champs */
    const hashedMdp = hashPassword(mdp);

    const role = "utilisateur";
    const statut = false;
    const statut_cotisation = false;

    try {
        const result = connexion.execute(
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
app.post('/POST/upload-photo', upload.fields([{ name: 'photo', maxCount: 1 }]), async (req, res) => {
    if (!req.files || !('photo' in req.files)) {
        return res.status(400).json({ message: 'No photo file uploaded' });
    }

    const info = JSON.parse(req.body.info);
    const { nom, nomphoto, description, isPublic, photographe, tags } = info; // `tags` contient une liste d'IDs des mots-clés
    const token = req.body.token;

    const tokenVerification = authenticateToken(token);
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const date_depot = new Date();

    const userId = getUserIdFromToken(req.body.token);

    // Récupérer les données EXIF de la photo
    const photoFile = req.files['photo'][0];
    let exifData = null;

    try {
        const buffer = await fs.promises.readFile(photoFile.path);
        const parser = ExifParserFactory.create(buffer);
        const result = parser.parse();
        exifData = result.tags;
    } catch (error) {
        console.error('Error parsing EXIF data:', error);
    }

    // Formater les données EXIF pour une meilleure lisibilité
    const formattedData = {
        "Paramètres de l'appareil photo": {
            Modèle: exifData?.Model,
            Objectif: exifData?.LensModel,
            LongueurFocale: `${exifData?.FocalLength} mm`,
            Equivalent35mm: `${exifData?.FocalLengthIn35mmFormat} mm`,
            Ouverture: `f/${exifData?.FNumber}`,
            TempsExposition: `${exifData?.ExposureTime} s`,
            ISO: exifData?.ISO,
            ModeExposition: exifData?.ExposureProgram,
        },
        "Conditions de capture": {
            Luminosité: exifData?.BrightnessValue,
            EquilibreDesBlancs: typeof exifData?.WhiteBalance === 'number' && exifData.WhiteBalance === 1 ? "Automatique" : "Manuel",
            ModeMesure: exifData?.MeteringMode,
            SourceLumière: exifData?.LightSource,
        },
        Flash: {
            Etat: typeof exifData?.Flash === 'number' && exifData.Flash === 16 ? "Non utilisé" : "Utilisé",
        },
        "Autres propriétés": {
            Dimensions: `${exifData?.ExifImageWidth} x ${exifData?.ExifImageHeight}`,
            Orientation: exifData?.Orientation === 1 ? "Normale" : "Rotée",
            EspaceColorimétrique: typeof exifData?.ColorSpace === 'number' && exifData.ColorSpace === 65535 ? "Non calibré" : exifData?.ColorSpace,
            Gamma: exifData?.Gamma,
            Logiciel: exifData?.Software,
        },
    };

    try {
        // Étape 1 : Insérer la photo
        const [result] = await connexion.promise().execute(
            `INSERT INTO Photo (nom, date_depot, exif, isPublic, id_utilisateur, id_utilisateur_1, légende) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nom, date_depot, JSON.stringify(formattedData), isPublic, userId, photographe, description]
        );

        const photoId = (result as unknown as mysql.ResultSetHeader).insertId;

        // Étape 2 : Insérer les associations dans la table de jointure (decrire)
        if (Array.isArray(tags) && tags.length > 0) {
            const tagValues = tags.map((tagId) => [photoId, tagId]);
            await connexion.promise().query(
                `INSERT INTO decrire (id_photo, id_mot_cle) VALUES ?`,
                [tagValues]
            );
        }

        // Étape 3 : Gérer le ficher photo
        const photoFile = req.files['photo'][0];

        // Vérification de l'existence des fichiers
        if (!fs.existsSync(photoFile.path)) {
            return res.status(500).json({ message: 'Temporary file not found' });
        }

        const photoFilePath = path.join(__dirname, 'photo', `${photoId}.jpg`);
        const minPhotoFilePath = path.join(__dirname, 'minphoto', `${photoId}.jpg`);

        await fs.promises.mkdir(path.dirname(photoFilePath), { recursive: true });
        await fs.promises.rename(photoFile.path, photoFilePath);

        // Créer une version de qualité réduite de la photo
        await fs.promises.mkdir(path.dirname(minPhotoFilePath), { recursive: true });
        await sharp(photoFilePath)
            .resize(800) // Redimensionner à une largeur de 800px
            .toFile(minPhotoFilePath);

        // Étape 4 : Retourner la réponse
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
                minPhotoFilePath,
                tags
            },
            exif : formattedData
        });
    } catch (error) {
        // Nettoyage des fichiers téléchargés en cas d'erreur
        if (req.files['photo']?.[0]?.path) await fs.promises.unlink(req.files['photo'][0].path).catch(console.error);
        if (req.files['exif']?.[0]?.path) await fs.promises.unlink(req.files['exif'][0].path).catch(console.error);

        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// création d'un évènement
app.post('/POST/create-event', async (req, res) => {
    const { date_heure_debut, date_heure_fin, titre, descriptif, lieu, type} = req.body.data;
    const token = req.body.token;

    const tokenVerification = authenticateToken(token);
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = getUserIdFromToken(token);

    try {
        const [result] = await connexion.promise().execute(
            `INSERT INTO evenement (date_heure_debut, date_heure_fin, titre, descriptif, lieu, type, id_utilisateur) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [date_heure_debut, date_heure_fin, titre, descriptif, lieu, type, userId]
        );

        res.status(201).json({
            message: 'Event created successfully',
            event: {
                id_evenement: (result as unknown as mysql.ResultSetHeader).insertId,
                date_heure_debut,
                date_heure_fin,
                titre,
                descriptif,
                lieu,
                type,
                id_utilisateur: userId
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// création d'un commentaire
app.post('/POST/create-comment', async (req, res) => {
    const id_photo = req.body.id_photo;
    const texte = req.body.texte;
    const token = req.body.token;

    const tokenVerification = authenticateToken(token);
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = getUserIdFromToken(token);

    const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        const [result] = await connexion.promise().execute(
            `INSERT INTO commentaire_p (id_photo, id_utilisateur, texte, date_heure) 
             VALUES (?, ?, ?, ?)`,
            [id_photo, userId, texte, formattedDate]  // Ajoutez formattedDate ici
        );

        res.status(201).json({
            message: 'Comment created successfully',
            comment: {
                id_commentaire: (result as unknown as mysql.ResultSetHeader).insertId,
                id_photo,
                id_utilisateur: userId,
                texte
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
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
    
    if (!tokenVerification.valid) {
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
    
    if (!tokenVerification.valid) {
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

// récupération liste des tags
app.get('/GET/tags', async (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token);
    
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    try {
        const [rows]: any = await connexion.promise().query(`SELECT * FROM motcle`);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// récupération des photos avec pagination
app.get('/GET/photosid', async (req, res) => {
    const token = req.query.token;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token);
    
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    try {
        const [rows]: any = await connexion.promise().query(
            `SELECT * FROM photo ORDER BY date_depot DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/GET/photo/metadata', async (req, res) => {
    const id = req.query.id;
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token);
    
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    try {
        // Récupérer les métadonnées de la photo
        const [rows]: any = await connexion.promise().query(
            `SELECT * FROM photo WHERE id_photo = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        const photo = rows[0];

        // Récupérer les informations des utilisateurs en une seule requête
        const [users]: any = await connexion.promise().query(
            `SELECT * FROM utilisateur WHERE id_utilisateur IN (?, ?)`, 
            [photo.id_utilisateur, photo.id_utilisateur_1]
        );

        // Transformer les utilisateurs en objets simples
        const utilisateur = users.find((user: { id_utilisateur: any; }) => user.id_utilisateur === photo.id_utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Primary user not found' });
        }

        // Assurer que les propriétés de l'utilisateur sont des valeurs primitives
        const cleanUtilisateur = {
            id_utilisateur: utilisateur.id_utilisateur,
            pseudo: utilisateur.pseudo,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom
        };

        photo.utilisateur = cleanUtilisateur;
        const utilisateur_1 = users.find((user: { id_utilisateur: any; }) => user.id_utilisateur === photo.id_utilisateur_1);

        // Ajouter les utilisateurs à la photo
        photo.id_utilisateur = utilisateur.nom;
        photo.id_utilisateur_1 = utilisateur_1.nom;

        // Retourner les métadonnées avec les utilisateurs associés
        res.status(200).json({
            id: photo.id_photo,
            nom: photo.nom,
            nom_min: photo.nom_min,
            date_prise_vue: photo.date_prise_vue,
            date_depot: photo.date_depot,
            exif: photo.exif,
            description: photo.légende,
            id_utilisateur: photo.id_utilisateur,
            id_utilisateur_1: photo.id_utilisateur_1,
            id_visionnage: photo.id_visionnage,
            id_evenement: photo.id_evenement,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// récupération des tags d'une photo
app.get('/GET/photo/tags', async (req, res) => {
    const id = req.query.id;
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token);
    
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    try {
        const [rows]: any = await connexion.promise().query(
            `SELECT motcle.* FROM motcle 
             JOIN decrire ON motcle.id_mot_cle = decrire.id_mot_cle 
             WHERE decrire.id_photo = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No tags found for this photo' });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// récupération miniature des photos
app.get('/GET/photo/filemin', async (req, res) => {
    const id = req.query.id;

    try {
        const [rows]: any = await connexion.promise().query(
            `SELECT * FROM photo WHERE id_photo = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        const photoDirectory = path.join(__dirname, 'minphoto');
        const photoFiles = await fs.promises.readdir(photoDirectory);
        const photoFile = photoFiles.find(file => path.parse(file).name === id);

        if (!photoFile) {
            return res.status(404).json({ message: 'Photo file not found' });
        }

        const photoPath = path.join(photoDirectory, photoFile);
        res.sendFile(photoPath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// récupération des évènements
app.get('/GET/events', async (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token);
    
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    try {
        const [rows]: any = await connexion.promise().query(`SELECT * FROM evenement ORDER BY date_heure_debut DESC`);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// récupération des IDs des commentaires triés du plus récent au plus ancien
app.get('/GET/commentaires', async (req, res) => {
    const id = req.query.id_photo;
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token);
    
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'Invalid or missing id_photo parameter' });
    }    

    try {
        const [commentIds]: any = await connexion.promise().query(
            `SELECT id_commentaire_p FROM commentaire_p WHERE id_photo = ? ORDER BY date_heure DESC`,
            [id]
        );

        if (commentIds.length === 0) {
            return res.status(404).json({ message: 'No comments found for this photo' });
        }

        res.status(200).json({
            commentIds: commentIds.map((row: any) => row.id_commentaire_p)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal pd Error' });
    }
});

// récupération d'un commentaire avec l'utilisateur associé
app.get('/GET/commentaire', async (req, res) => {
    const { id, token } = req.query;

    // Vérification du token
    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token as string);
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    // Validation de l'ID
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'Invalid or missing id parameter' });
    }

    try {
        // Récupérer le commentaire et l'utilisateur associé en une seule requête
        const [rows]: any = await connexion.promise().query(
            `
            SELECT 
                c.id_commentaire_p AS id, 
                c.texte, 
                c.date_heure, 
                u.pseudo 
            FROM 
                commentaire_p c
            JOIN 
                utilisateur u 
            ON 
                c.id_utilisateur = u.id_utilisateur
            WHERE 
                c.id_commentaire_p = ?
            `,
            [id]
        );

        // Formater la date en JJ MM AAAA HH:MM:SS
        rows.forEach((row: any) => {
            const date = new Date(row.date_heure);
            const formattedDate = date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
            });
            row.date_heure = formattedDate;
        });
        
        // Vérification si le commentaire existe
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Retourner le commentaire au frontend
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Database Error:', (error as Error).message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// récupération des IDs des commentaires triés du plus récent au plus ancien
app.get('/GET/commentaires', async (req, res) => {
    const id = req.query.id_photo;
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token);
    
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'Invalid or missing id_photo parameter' });
    }    

    try {
        const [commentIds]: any = await connexion.promise().query(
            `SELECT id_commentaire_p FROM commentaire_p WHERE id_photo = ? ORDER BY date_heure DESC`,
            [id]
        );

        if (commentIds.length === 0) {
            return res.status(404).json({ message: 'No comments found for this photo' });
        }

        res.status(200).json({
            commentIds: commentIds.map((row: any) => row.id_commentaire_p)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal pd Error' });
    }
});

// récupération d'un commentaire avec l'utilisateur associé
app.get('/GET/commentaire', async (req, res) => {
    const { id, token } = req.query;

    // Vérification du token
    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token as string);
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    // Validation de l'ID
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'Invalid or missing id parameter' });
    }

    try {
        // Récupérer le commentaire et l'utilisateur associé en une seule requête
        const [rows]: any = await connexion.promise().query(
            `
            SELECT 
                c.id_commentaire_p AS id, 
                c.texte, 
                c.date_heure, 
                u.pseudo 
            FROM 
                commentaire_p c
            JOIN 
                utilisateur u 
            ON 
                c.id_utilisateur = u.id_utilisateur
            WHERE 
                c.id_commentaire_p = ?
            `,
            [id]
        );

        // Formater la date en JJ MM AAAA HH:MM:SS
        rows.forEach((row: any) => {
            const date = new Date(row.date_heure);
            const formattedDate = date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
            });
            row.date_heure = formattedDate;
        });
        
        // Vérification si le commentaire existe
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Retourner le commentaire au frontend
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Database Error:', (error as Error).message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


/* Profil Utilisateur */
app.get('/GET/utilisateur', async (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token);
    
    if (!tokenVerification?.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    try {
        const userid = getUserIdFromToken(token);
        const [rows]: any = await connexion.promise().query('SELECT nom, prenom, email, telephone FROM utilisateur WHERE id = ?', [userid]);

        // Vérification si l'utilisateur existe
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Envoi des informations utilisateur
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// récupération id photos publique aléatoire pour la page d'accueil
app.get('/GET/random-photos', async (req, res) => {
    try {
        const [rows]: any = await connexion.promise().query(`SELECT DISTINCT id_photo FROM photo WHERE isPublic = 1 ORDER BY RAND() LIMIT 6`);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


/*-----------------------------------------DELETE---------------------------------------------- */
