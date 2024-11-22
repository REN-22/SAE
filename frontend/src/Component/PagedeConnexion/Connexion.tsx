import React, { useState } from 'react';
import './Connexion.css';

interface Connexionprops {
  setPage: any;
}

const Connexion: React.FC<Connexionprops> = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Ajoutez ici la logique de connexion, comme un appel API
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="connexion-container">
      <h2>Connexion</h2>
      <form onSubmit={handleLogin} className="connexion-form">
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
        <button type="submit" className="connexion-button">Connexion</button>
      </form>
    </div>
  );
}

export default Connexion;