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
import { console } from 'inspector';

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
app.post('/POST/upload-photo', upload.fields([{ name: 'exif', maxCount: 1 }, { name: 'photo', maxCount: 1 }]), async (req, res) => {
    if (!req.files || !('photo' in req.files)) {
        return res.status(400).json({ message: 'No photo file uploaded' });
    }

    const info = JSON.parse(req.body.info);
    const { nom, nomphoto, description, isPublic, photographe, tags } = info; // `tags` contient une liste d'IDs des mots-clés
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
        // Étape 1 : Insérer la photo
        const [result] = await connexion.promise().execute(
            `INSERT INTO Photo (nom, date_depot, exif, isPublic, id_utilisateur, id_utilisateur_1, légende) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nom, date_depot, exif, isPublic, userId, photographe, description]
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

        // Étape 3 : Gérer les fichiers (photo et exif)
        const photoFile = req.files['photo'][0];

        // Vérification de l'existence des fichiers
        if (!fs.existsSync(photoFile.path)) {
            return res.status(500).json({ message: 'Temporary file not found' });
        }

        const photoFilePath = path.join(__dirname, 'photo', `${photoId}`);
        const minPhotoFilePath = path.join(__dirname, 'minphoto', `${photoId}`);

        await fs.promises.mkdir(path.dirname(photoFilePath), { recursive: true });
        await fs.promises.rename(photoFile.path, photoFilePath);

        // Créer une version de qualité réduite de la photo
        await fs.promises.mkdir(path.dirname(minPhotoFilePath), { recursive: true });
        await sharp(photoFilePath)
            .resize(800) // Redimensionner à une largeur de 800px
            .toFile(minPhotoFilePath);

        if (req.files['exif']) {
            const exifFile = req.files['exif'][0];
            const exifFilePath = path.join(__dirname, 'exif', `${photoId}.exif`);

            await fs.promises.mkdir(path.dirname(exifFilePath), { recursive: true });
            await fs.promises.rename(exifFile.path, exifFilePath);
        }

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

/* Import de fichier pdf */
app.post('/POST/upload-pdf', uploadPdf.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    const pdfFilePath = req.file.path;
    const pdfFileName = req.file.filename;
    const date_depot = new Date();
    const id_evenement = req.body.id_evenement;  // ID de l'événement
    const id_utilisateur = getUserIdFromToken(req.body.token);  // Récupérer l'ID de l'utilisateur

    try {
        // Insertion dans la table 'document'
        const [result] = await connexion.promise().execute(
            'INSERT INTO document (nom, chemin, date_depot, id_evenement, id_utilisateur) VALUES (?, ?, ?, ?, ?)',
            [pdfFileName, pdfFilePath, date_depot, id_evenement, id_utilisateur]
        );

        res.status(201).json({
            message: 'PDF uploaded successfully',
            document: {
                id_document: result.insertId,
                nom: pdfFileName,
                chemin: pdfFilePath,
                date_depot,
                id_evenement,
                id_utilisateur
            }
        });
    } catch (error) {
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


// récupération liste des photos triées par date de dépôt
app.get('/GET/photosid', async (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    const tokenVerification = authenticateToken(token);
    
    if (!tokenVerification.valid) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    try {
        const [rows]: any = await connexion.promise().query(`SELECT * FROM photo ORDER BY date_depot DESC`);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// // récupération d'une photo avec sa version de moindre qualité
// app.get('/GET/photo', async (req, res) => {
//     const id = req.query.id;
//     const token = req.query.token;

//     if (!token) {
//         return res.status(400).json({ message: 'Token is missing' });
//     }

//     const tokenVerification = authenticateToken(token);
    
//     if (!tokenVerification.valid) {
//         return res.status(401).json({ message: 'Invalid token' });
//     }

//     try {
//         const [rows]: any = await connexion.promise().query(
//             `SELECT * FROM photo WHERE id_photo = ?`, 
//             [id]
//         );

//         if (rows.length === 0) {
//             return res.status(404).json({ message: 'Photo not found' });
//         }

//         const photo = rows[0];

//         // Path to the original photo
//         const photoPath = path.join(__dirname, 'photos', `${photo.id_photo}.jpg`);
//         // Path to the minified version
//         const minPhotoPath = path.join(__dirname, 'minphoto', `${photo.id_photo}.jpg`);

//         if (!fs.existsSync(photoPath)) {
//             return res.status(404).json({ message: 'Photo file not found' });
//         }

//         if (!fs.existsSync(minPhotoPath)) {
//             return res.status(404).json({ message: 'Min photo file not found' });
//         }

//         // Send the original photo and the minified photo as files
//         res.status(200).sendFile(minPhotoPath, (err) => {
//             if (err) {
//                 console.error('Error sending the min photo:', err);
//                 res.status(500).json({ message: 'Error sending min photo' });
//             } else {
//                 console.log('Min photo sent successfully.');
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

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

app.get('/GET/photo/file', async (req, res) => {
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


/*-----------------------------------------DELETE---------------------------------------------- */
