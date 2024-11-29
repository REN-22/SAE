import React, { useState } from 'react';
import './Document.css';
import axios from 'axios';

interface DocumentProps {
  setPage: (page: number) => void;
}

const Document: React.FC<DocumentProps> = ({ setPage }) => {
    const [uploadedPdf, setUploadedPdf] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null); // État pour le fichier sélectionné

  // Gérer l'importation du fichier
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile); // Stocker le fichier sélectionné
    } else {
      alert('Veuillez importer un fichier PDF valide.');
    }
  };

  // Valider l'importation (prévisualisation et stockage du fichier)
  const handleValidateUpload = () => {
    if (file) {
      const fileURL = URL.createObjectURL(file); // Générer l'URL pour le fichier
      setUploadedPdf(fileURL); // Prévisualisation du PDF
      setFile(null); // Effacer le fichier sélectionné après validation
    }
  };

  // Annuler l'importation
  const handleCancelUpload = () => {
    setFile(null); // Effacer le fichier sélectionné
    setUploadedPdf(null); // Supprimer la prévisualisation
  };

  return (
    <div className="Documents-container">
        <div className="MenuFil">
            <button onClick={() => setPage(4)}>Nouveau Post</button>
            <button onClick={() => setPage(6)}>Documents Consultable</button>
        </div>
        <div className="DocOblietImport">
        <div className="Documents">
            <h2>Documents Consultables</h2>
            <div className="DocOblig">
                <h3>Règles du site Web</h3>
                <p>
                    Bienvenue sur le site web du Club Photo Nailloux, un espace dédié à la photographie, à l'échange et à la 
                    convivialité. Nous vous invitons à lire attentivement le règlement ci-dessous avant d'utiliser notre site. 
                    En vous inscrivant et en participant aux activités proposées, vous acceptez de respecter ces règles.
                    </p>
                    <h4>1. Comportement Respectueux</h4>
                    <p>Nous encourageons un environnement respectueux et accueillant pour tous. Les discussions doivent rester 
                        courtoises et bienveillantes. Les propos injurieux, discriminatoires, haineux ou offensants envers les autres 
                        membres ou toute personne sont strictement interdits.
                    </p>
                    <h4>2. Respect des Droits d'Auteur</h4>
                    <p>Chaque membre doit respecter les droits d'auteur et ne doit télécharger que des photographies qu'il a prises ou 
                        pour lesquelles il dispose des droits nécessaires. Le vol de contenu ou la violation des droits de propriété 
                        intellectuelle est formellement interdit.
                    </p>
                    <h4>3. Partage de Contenus</h4>
                    <p>Les membres peuvent partager leurs œuvres sur la plateforme dans la section dédiée, mais doivent s'assurer que 
                        ces photos respectent la vie privée des personnes et la législation en vigueur. Aucune photo ne doit comporter 
                        de contenu choquant, pornographique ou illégal.
                    </p>
                    <h4>4. Commentaires et Critiques Constructives</h4>
                    <p>Les commentaires sur les photos doivent être constructifs et respectueux. Si vous critiquez une photo, faites-le 
                        de manière bienveillante et avec l’intention d’aider l’auteur à progresser. Toute forme de dénigrement ou de 
                        critique destructrice sera modérée.
                    </p>
                    <h4>5. Protection des Données Personnelles</h4>
                    <p>Le site respecte la confidentialité et la sécurité des données personnelles des membres. Les informations 
                        collectées seront utilisées uniquement pour l’administration du site et des activités du club. Aucune donnée 
                        personnelle ne sera partagée sans le consentement explicite de l’utilisateur.
                    </p>
                    <h4>6. Utilisation des Forums et Espaces Publics</h4>
                    <p>Lorsque vous participez aux forums ou discussions publiques, veillez à ne pas diffuser d’informations 
                        personnelles ou sensibles sans protection adéquate. Assurez-vous de respecter la confidentialité des 
                        discussions privées.
                    </p>
                    <h4>7. Modération</h4>
                    <p>Le club se réserve le droit de modérer tous les contenus postés sur le site. En cas de non-respect des règles, 
                        des avertissements seront donnés. En cas de récidive ou de comportement particulièrement inapproprié, l'accès 
                        au site pourra être suspendu ou l'adhésion révoquée.
                    </p>
                    <h4>8. Sécurité</h4>
                    <p>Les utilisateurs doivent respecter la sécurité du site en ne téléchargeant pas de fichiers malveillants, de 
                        virus ou d'autres contenus nuisibles. Toute tentative d’intrusion ou de modification du fonctionnement du site 
                        sera sanctionnée.
                    </p>
                    <h4>9. Événements et Activités</h4>
                    <p>Les membres peuvent organiser des événements ou participer à des ateliers proposés par le club. Les inscriptions 
                        à ces événements doivent être confirmées via le site et doivent être respectées. En cas d’annulation, merci de 
                        prévenir les organisateurs à l’avance.
                    </p>
                    <h4>10. Modification du Règlement</h4>
                    <p>Le club se réserve le droit de modifier ce règlement à tout moment. Toute modification sera publiée sur le site, 
                        et il est de la responsabilité des membres de consulter régulièrement les mises à jour.
                    </p>
                </div>
                </div>
                {/* Ajout de l'importation de PDF */}
          <div className="UploadSection">
            <h2>Importer un Document PDF</h2>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="UploadInput"
            />

            {/* Affichage des boutons de validation et d'annulation */}
            {file && (
              <div>
                <button onClick={handleValidateUpload} className="UploadButton">
                  Valider l'import
                </button>
                <button onClick={handleCancelUpload} className="CancelButton">
                  Annuler l'import
                </button>
              </div>
            )}

            {/* Prévisualisation du PDF si validé */}
            {uploadedPdf && (
              <div className="PdfPreview">
                <h4>Document Importé :</h4>
                <iframe
                  src={uploadedPdf}
                  width="100%"
                  height="500px"
                  title="Prévisualisation PDF"
                  style={{ border: '1px solid #ccc', marginTop: '10px' }}
                ></iframe>
              </div>
            )}
          </div>
            </div>
        </div>
  );
}

export default Document;