import React, { useState , useEffect} from "react";
import "./profil.css";
import axios from 'axios';

interface UserProfileProps {
  setPage: any;
}

const Profil: React.FC<UserProfileProps> = ({ setPage }) => {
  const [isNomPublic, setIsNomPublic] = useState<boolean>(false);
  const [isPrenomPublic, setIsPrenomPublic] = useState<boolean>(false);
  const [isEmailPublic, setIsEmailPublic] = useState<boolean>(false);
  const [isTelephonePublic, setIsTelephonePublic] = useState<boolean>(false);

  //const nom = "Harry ";
  //const prenom = "Potter ";
  //const email = "harry.potter@gmail.com ";
  //const telephone = "+33 6 06 06 06 06 ";

  const [prenom] = useState<string>("");
  const [nom] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telephone] = useState<string>("");
  const [error, setError] = useState<string>("");

   // Appel API pour récupérer les informations utilisateur
   useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("phototoken");

      if (!token) {
        setError("Token manquant");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/GET/utilisateur", {
          params: { token: token },
        });

        // Mise à jour des états avec les données de l'API
        setLastName(response.data.nom);
        setFirstName(response.data.prenom);
        setEmail(response.data.email);
        setPhone(response.data.telephone);
      } catch (error: any) {
        if (error.response) {
          // Erreur provenant du serveur
          setError(error.response.data.message || "Erreur du serveur");
        } else {
          // Erreur côté client (réseau, etc.)
          setError("Une erreur est survenue");
        }
        console.error(error);
      }
    };

    fetchUserData();
  }, []); // Le tableau vide [] signifie que l'effet se déclenche uniquement au montage du composant.

  return (
    <div className="user-profile">
      <h1>Profil Utilisateur</h1>
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
function setLastName(nom: any) {
  throw new Error("Function not implemented.");
}

function setFirstName(prenom: any) {
  throw new Error("Function not implemented.");
}

function setPhone(telephone: any) {
  throw new Error("Function not implemented.");
}

