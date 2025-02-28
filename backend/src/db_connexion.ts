import mysql from 'mysql2';

const connexion = mysql.createConnection({
    host: 'db',
    user: 'root',
    password: '',
    database: 'dbphoto'
});

connexion.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

export default connexion;
