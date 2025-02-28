import React, { useState } from 'react';
import './Inscription.css';
import axios from 'axios';

interface InscriptionProps {
  setPage: (page: number) => void;
}

const Inscription: React.FC<InscriptionProps> = ({ setPage }) => {
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
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    axios.post('http://backend:5000/POST/create-user', {
      pseudo,
      nom: lastName,
      prenom: firstName,
      adresse,
      cp,
      ville,
      telephone: phone,
      mail: email,
      mdp: password,
      notif_mail: emailNotification,
    })
      .then((response) => {
        console.log('Success:', response.data);
        setPage(0); // Redirect to another page after successful registration
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
        {errorMessage && <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>}
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
          <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          <button type="submit" className="validate-button">Valider</button>
          <button type="button" className="cancel-button" onClick={() => setPage(0)}>Annuler</button>
        </div>
      </form>
    </div>
  );
}

export default Inscription;