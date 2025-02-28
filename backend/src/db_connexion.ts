import mysql from 'mysql2';

const connexion = mysql.createConnection({
    host: 'bd',
    user: 'root',
    password: '',
    database: 'dbphoto',
    port: 3306
});

connexion.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à MySQL:', err.message);
        return;
    }
    console.log('Connexion à MySQL réussie !');
});

export default connexion;
