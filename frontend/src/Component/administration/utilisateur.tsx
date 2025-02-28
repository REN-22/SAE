import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserProps {
    id: number;
}

const Utilisateur: React.FC<UserProps> = ({ id }) => {
    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');
    const [nomUtilisateur, setNomUtilisateur] = useState('');
    const [compteValide, setCompteValide] = useState(false);
    const [cotisationPayee, setCotisationPayee] = useState(false);
    const token = localStorage.getItem('phototoken');

    useEffect(() => {
        const fetchUtilisateur = async () => {
            try {
                const response = await axios.get('http://backend:5000/GET/userid', {
                    params: { id: id, token: token }
                });
                const utilisateur = response.data;
                setPrenom(utilisateur.prenom);
                setNom(utilisateur.nom);
                setNomUtilisateur(utilisateur.pseudo);
                setCompteValide(utilisateur.accountValidated);
                setCotisationPayee(utilisateur.subscriptionPaid);
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
            }
        };

        fetchUtilisateur();
    }, [id]);

    const handleValidationCompte = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir valider ce compte ?')) {
            try {
                await axios.put('http://backend:5000/PUT/validate-user', {
                    id: id,
                    token: token
                });
                setCompteValide(true);
            } catch (error) {
                console.error('Erreur lors de la validation du compte :', error);
            }
        }
    };

    const handlePaiementCotisation = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir valider ce paiement de cotisation ?')) {
            try {
                await axios.put('http://backend:5000/PUT/validate-cotisation', {
                    id: id,
                    token: token
                });
                setCotisationPayee(true);
            } catch (error) {
                console.error('Erreur lors de la validation du paiement de cotisation :', error);
            }
        }
    };

    return (
        <div>
            <h2>Informations de l'utilisateur</h2>
            <p>Prénom: {prenom}</p>
            <p>Nom: {nom}</p>
            <p>Nom d'utilisateur: {nomUtilisateur}</p>
            <button onClick={handleValidationCompte} disabled={compteValide}>
                {compteValide ? 'Compte Validé' : 'Valider le Compte'}
            </button>
            <button onClick={handlePaiementCotisation} disabled={cotisationPayee}>
                {cotisationPayee ? 'Cotisation Payée' : 'Valider le Paiement de la Cotisation'}
            </button>
        </div>
    );
};

export default Utilisateur;
