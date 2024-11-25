import React, { useState } from 'react';
import './Connexion.css';
import axios from 'axios';

interface ConnexionProps {
  setPage: (page: number) => void;
  setIsConnected: (isConnected: boolean) => void;
  isConnected: boolean;
}

const Connexion: React.FC<ConnexionProps> = ({ setPage, setIsConnected, isConnected }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Connexion en cours...');
  
    axios
      .get(
        `http://localhost:5000/GET/connexion?mail=${encodeURIComponent(
          email,
        )}&mdp=${encodeURIComponent(password)}`
      )
      .then((response) => {
        console.log('Success:', response.data);
        const token = response.data;
        
        if (token) {
          localStorage.setItem('phototoken', token);
          console.log('Token enregistré dans localStorage:', token);
  
          // Vérification du token
          console.log('Vérification du token en cours...');
          return axios.get('http://localhost:5000/GET/verify-token', {
            params: {
              token: token
            }
          });
        } else {
          console.error('Le token est vide ou non valide');
          throw new Error('Token invalide');
        }
      })
      .then((verifyResponse) => {
        console.log('Réponse de la vérification du token:', verifyResponse.data);
  
        if (verifyResponse.data.message === 'Token is valid') {
          setIsConnected(true);
          console.log('Utilisateur connecté :', isConnected);
          setPage(1);
        } else {
          console.warn('Token invalide lors de la vérification');
          setIsConnected(false);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          console.error('Mot de passe incorrect');
        } else {
          console.error('Erreur lors de la requête ou de la vérification du token:', error);
        }
      });
  };
  
  
  

  return (
    <div className="connexion-container">
      <h2>Connexion</h2>
      <form onSubmit={handleLogin} className="connexion-form">
        <div className="input-Ccontainer">
          <label htmlFor="email">Adresse e-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="input-ccontainer">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <button type="submit" className="connexion-button">Connexion</button>
      </form>
    </div>
  );
}

export default Connexion;