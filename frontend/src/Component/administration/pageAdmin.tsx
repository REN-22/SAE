import React, { useEffect, useState } from 'react';
import axios from 'axios';
import User from './utilisateur';

const PageAdmin: React.FC = () => {
    const [utilisateurs, setUtilisateurs] = useState<number[]>([]);
    const token = localStorage.getItem('phototoken');

    useEffect(() => {
        const fetchUtilisateurs = async () => {
            try {
                const response = await axios.get('http://localhost:5000/GET/users-not-validated', {
                    params: { token: token }
                });
                const ids = response.data.map((user: { id_utilisateur: number }) => user.id_utilisateur);
                setUtilisateurs(ids);
            } catch (error) {
                console.error('Error fetching utilisateurs:', error);
            }
        };

        fetchUtilisateurs();
    }, []);

    return (
        <div>
            <h1>Page d'administration</h1>
            <h2>Comptes non validés et/ou cotisation non payer</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <ul>
                    {utilisateurs.map(utilisateur => (
                        <li key={utilisateur}>
                            <User id={utilisateur} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PageAdmin;