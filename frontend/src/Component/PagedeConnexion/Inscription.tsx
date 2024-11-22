import React, { useState } from 'react';
import './Inscription.css';

interface Inscriptionprops {
  setPage: any;
}

const Inscription: React.FC <Inscriptionprops> = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'inscription, comme un appel API
    console.log('Nom:', lastName);
    console.log('Prénom:', firstName);
    console.log('Email:', email);
    console.log('Mot de passe:', password);
    console.log('Téléphone:', phone);
  };

  const handleCancel = () => {
    // Réinitialise les champs du formulaire
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setPhone('');
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
        <button type="submit" className="validate-button">Valider</button>
        <button type="button" className="cancel-button" onClick={handleCancel}>Annuler</button>
      </form>
    </div>
  );
}

export default Inscription;