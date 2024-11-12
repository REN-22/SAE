import mysql from 'mysql2';

const connexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DBPHOTO'
});

connexion.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

export const executeQuery = (query: string, callback: (err: mysql.QueryError | null, results?: any) => void) => {
    connexion.query(query, (err, results) => {
        if (err) {
            console.error('Error querying MySQL:', err);
            callback(err);
            return;
        }
        console.log('Query results:', results);
        callback(null, results);
    });
};


export default connexion;
