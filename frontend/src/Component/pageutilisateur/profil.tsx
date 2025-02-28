import React, { useState, useEffect } from "react";
import "./profil.css";
import axios from 'axios';

interface UserProfileProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const UserProfile: React.FC<UserProfileProps> = ({ setPage }) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('phototoken');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://backend:5000/GET/user', {
          params: { token }
        });
        setUserInfo(response.data);
        console.log(response.data);
      } catch (err) {
        setError(`Échec de la récupération des informations utilisateur : ${(err as any).response.data.message}`);
        console.error(err);
      }
    };

    fetchUserInfo();
  }, []);

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (!userInfo) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1>Page de Profil</h1>
      <p>Bienvenue sur votre page de profil !</p>
      <div>
        <h2>Informations Utilisateur</h2>
        <p>Pseudo : {userInfo.pseudo}</p>
        <p>Nom : {userInfo.nom}</p>
        <p>Prénom : {userInfo.prenom}</p>
        <p>Adresse : {userInfo.adresse}</p>
        <p>Code Postal : {userInfo.cp}</p>
        <p>Ville : {userInfo.ville}</p>
        <p>Téléphone : {userInfo.telephone}</p>
        <p>Email : {userInfo.mail}</p>
        <p>Notifications par Email : {userInfo.notif_mail ? 'Activées' : 'Désactivées'}</p>
      </div>
    </div>
  );
};

export default UserProfile;