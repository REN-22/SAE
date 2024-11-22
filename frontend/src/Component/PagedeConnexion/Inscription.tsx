import React, { useState } from 'react';
import './CIStyle.css';
import axios from 'axios';

interface InscriptionProps {
  setPage: (page: number) => void;
}

const Inscription: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [pseudo, setPseudo] = useState<string>('');
  const [adresse, setAdresse] = useState<string>('');
  const [cp, setCp] = useState<string>('');
  const [ville, setVille] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [emailNotification, setEmailNotification] = useState<boolean>(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'inscription, comme un appel API
    console.log('Inscription en cours...');
    console.log('Nom:', lastName);
    console.log('Prénom:', firstName);
    console.log('Pseudo:', pseudo);
    console.log('Adresse:', adresse);
    console.log('Code postal:', cp);
    console.log('Ville:', ville);
    console.log('Email:', email);
    console.log('Mot de passe:', password);
    console.log('Téléphone:', phone);
    console.log('Notification par e-mail:', emailNotification);

    axios.post('http://localhost:5000/POST/create-user', {
      pseudo,
      nom: lastName,
      prenom: firstName,
      adresse,
      cp,
      ville,
      telephone: phone,
      mail: email,
      mdp: password,
      role: 'pegu', // ACHANGER TEST
      statut: true, // ACHANGER TEST
      notif_mail: emailNotification,
      statut_cotisation: true, // ACHANGER TEST
    })
      .then((response) => {
        console.log('Success:', response.data);
        setPage(1); // Redirect to another page after successful registration
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="inscription-container">
      <h2>Inscription</h2>
      <form onSubmit={handleRegister} className="inscription-form">
        <div className="input-container">
          <label htmlFor="lastName">Nom</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="input-container">
          <label htmlFor="firstName">Prénom</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="input-container">
          <label htmlFor='pseudo'>Pseudo</label>
          <input
            type="text"
            id="pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="input-container">
          <label htmlFor="adresse">Adresse</label>
          <input
            type="text"
            id="adresse"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="input-container">
          <label htmlFor="cp">Code postal</label>
          <input
            type="text"
            id="cp"
            value={cp}
            onChange={(e) => setCp(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="input-container">
          <label htmlFor="ville">Ville</label>
          <input
            type="text"
            id="ville"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="input-container">
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
        <div className="input-container">
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
        <div className="input-container">
          <label htmlFor="phone">Numéro de téléphone</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="input-container-checkbox">
          <input
            type="checkbox"
            id="emailNotification"
            onChange={(e) => setEmailNotification(e.target.checked)}
          />
          <label htmlFor="emailNotification">Notification par e-mail</label>
        </div>
        <div className="CIbutton-container">
          <button type="submit" className="validate-button" onClick={() => handleRegister}>Valider</button>
          <button type="button" className="cancel-button" onClick={() => setPage(1)}>Annuler</button>
        </div>
      </form>
    </div>
  );
}

export default Inscription;