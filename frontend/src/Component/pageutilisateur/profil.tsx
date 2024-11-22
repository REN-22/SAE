import React, { useState } from "react";
import "./profil.css";

interface UserProfileProps {
  setPage: any;
}

const Profil: React.FC<UserProfileProps> = ({ setPage }) => {
  const [isNomPublic, setIsNomPublic] = useState<boolean>(false);
  const [isPrenomPublic, setIsPrenomPublic] = useState<boolean>(false);
  const [isEmailPublic, setIsEmailPublic] = useState<boolean>(false);
  const [isTelephonePublic, setIsTelephonePublic] = useState<boolean>(false);

  const nom = "Harry ";
  const prenom = "Potter ";
  const email = "harry.potter@gmail.com ";
  const telephone = "+33 6 06 06 06 06 ";

  return (
    <div className="user-profile">
      <h1>a's Profile</h1>
      <div>
        <p>
          Nom: {nom}
          <button
            className={isNomPublic ? "button-public" : "button-private"}
            onClick={() => setIsNomPublic(!isNomPublic)}
          >
            {isNomPublic ? "Public" : "Privé"}
          </button>
        </p>
        <p>
          Prénom: {prenom}
          <button
            className={isPrenomPublic ? "button-public" : "button-private"}
            onClick={() => setIsPrenomPublic(!isPrenomPublic)}
          >
            {isPrenomPublic ? "Public" : "Privé"}
          </button>
        </p>
        <p>
          Email: {email}
          <button
            className={isEmailPublic ? "button-public" : "button-private"}
            onClick={() => setIsEmailPublic(!isEmailPublic)}
          >
            {isEmailPublic ? "Public" : "Privé"}
          </button>
        </p>
        <p>
          Téléphone: {telephone}
          <button
            className={isTelephonePublic ? "button-public" : "button-private"}
            onClick={() => setIsTelephonePublic(!isTelephonePublic)}
          >
            {isTelephonePublic ? "Public" : "Privé"}
          </button>
        </p>
      </div>
      <div className="button-container">
        <button className="modifier-button">Modifier</button>
        <button className="photo-feed-button" onClick={() => setPage(1)}>
          Fil de photo
        </button>
      </div>
    </div>
  );
};

export default Profil;
