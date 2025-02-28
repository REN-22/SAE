-- Initialisation de la base de données : `dbphoto`
CREATE DATABASE IF NOT EXISTS dbphoto;
USE dbphoto;

-- Structure de la table `commentaire_e`
CREATE TABLE `commentaire_e` (
  `id_commentaire_e` int(11) NOT NULL AUTO_INCREMENT,
  `texte` text DEFAULT NULL,
  `date_heure` datetime DEFAULT NULL,
  `id_evenement` int(11) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  PRIMARY KEY (`id_commentaire_e`),
  KEY `id_evenement` (`id_evenement`),
  KEY `id_utilisateur` (`id_utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Structure de la table `commentaire_p`
CREATE TABLE `commentaire_p` (
  `id_commentaire_p` int(11) NOT NULL AUTO_INCREMENT,
  `texte` text DEFAULT NULL,
  `date_heure` datetime DEFAULT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `id_photo` int(11) NOT NULL,
  PRIMARY KEY (`id_commentaire_p`),
  KEY `id_utilisateur` (`id_utilisateur`),
  KEY `id_photo` (`id_photo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Structure de la table `decrire`
CREATE TABLE `decrire` (
  `id_photo` int(11) NOT NULL,
  `id_mot_cle` int(11) NOT NULL,
  PRIMARY KEY (`id_photo`, `id_mot_cle`),
  KEY `id_mot_cle` (`id_mot_cle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Structure de la table `document`
CREATE TABLE `document` (
  `id_document` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) DEFAULT NULL,
  `date_depot` datetime DEFAULT NULL,
  `id_evenement` int(11) DEFAULT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_document`),
  KEY `id_evenement` (`id_evenement`),
  KEY `id_utilisateur` (`id_utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Structure de la table `evenement`
CREATE TABLE `evenement` (
  `id_evenement` int(11) NOT NULL AUTO_INCREMENT,
  `titre` varchar(50) DEFAULT NULL,
  `descriptif` text DEFAULT NULL,
  `lieu` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `id_utilisateur` int(11) DEFAULT NULL,
  `date_heure_debut` datetime DEFAULT NULL,
  `date_heure_fin` datetime DEFAULT NULL,
  PRIMARY KEY (`id_evenement`),
  KEY `id_utilisateur` (`id_utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Structure de la table `motcle`
CREATE TABLE `motcle` (
  `id_mot_cle` int(11) NOT NULL AUTO_INCREMENT,
  `texte` varchar(50) DEFAULT NULL,
  `statut` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_mot_cle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Structure de la table `participation`
CREATE TABLE `participation` (
  `id_utilisateur` int(11) NOT NULL,
  `id_evenement` int(11) NOT NULL,
  `presence` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id_utilisateur`, `id_evenement`),
  KEY `id_evenement` (`id_evenement`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Structure de la table `photo`
CREATE TABLE `photo` (
  `id_photo` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(200) NOT NULL,
  `nom_min` varchar(200) DEFAULT NULL,
  `date_prise_vue` datetime DEFAULT NULL,
  `date_depot` datetime DEFAULT NULL,
  `exif` longtext DEFAULT NULL CHECK (json_valid(`exif`)),
  `id_utilisateur` int(11) NOT NULL,
  `id_utilisateur_1` int(11) NOT NULL,
  `id_visionnage` int(11) DEFAULT NULL,
  `id_evenement` int(11) DEFAULT NULL,
  `legende` varchar(255) DEFAULT NULL,
  `isPublic` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id_photo`),
  KEY `id_utilisateur` (`id_utilisateur`),
  KEY `id_utilisateur_1` (`id_utilisateur_1`),
  KEY `id_visionnage` (`id_visionnage`),
  KEY `id_evenement` (`id_evenement`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Structure de la table `utilisateur`
CREATE TABLE `utilisateur` (
  `id_utilisateur` int(11) NOT NULL AUTO_INCREMENT,
  `pseudo` varchar(50) DEFAULT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `adresse` varchar(100) DEFAULT NULL,
  `cp` int(5) DEFAULT NULL,
  `ville` varchar(50) DEFAULT NULL,
  `telephone` char(10) DEFAULT NULL,
  `mail` varchar(50) NOT NULL,
  `mdp` varchar(128) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `statut` tinyint(1) DEFAULT NULL,
  `notif_mail` tinyint(1) DEFAULT NULL,
  `statut_cotisation` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_utilisateur`),
  UNIQUE KEY `mail` (`mail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Structure de la table `visionnage`
CREATE TABLE `visionnage` (
  `id_visionnage` int(11) NOT NULL AUTO_INCREMENT,
  `date_visibilite` datetime DEFAULT NULL,
  `date_diffusion` datetime DEFAULT NULL,
  `id_evenement` int(11) NOT NULL,
  PRIMARY KEY (`id_visionnage`),
  UNIQUE KEY `id_evenement` (`id_evenement`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Contraintes pour les tables
ALTER TABLE `commentaire_e`
  ADD CONSTRAINT `commentaire_e_ibfk_1` FOREIGN KEY (`id_evenement`) REFERENCES `evenement` (`id_evenement`),
  ADD CONSTRAINT `commentaire_e_ibfk_2` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`);

ALTER TABLE `commentaire_p`
  ADD CONSTRAINT `commentaire_p_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`),
  ADD CONSTRAINT `commentaire_p_ibfk_2` FOREIGN KEY (`id_photo`) REFERENCES `photo` (`id_photo`);

ALTER TABLE `decrire`
  ADD CONSTRAINT `decrire_ibfk_1` FOREIGN KEY (`id_photo`) REFERENCES `photo` (`id_photo`),
  ADD CONSTRAINT `decrire_ibfk_2` FOREIGN KEY (`id_mot_cle`) REFERENCES `motcle` (`id_mot_cle`);

ALTER TABLE `document`
  ADD CONSTRAINT `document_ibfk_1` FOREIGN KEY (`id_evenement`) REFERENCES `evenement` (`id_evenement`),
  ADD CONSTRAINT `document_ibfk_2` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`);

ALTER TABLE `evenement`
  ADD CONSTRAINT `evenement_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`);

ALTER TABLE `participation`
  ADD CONSTRAINT `participation_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`),
  ADD CONSTRAINT `participation_ibfk_2` FOREIGN KEY (`id_evenement`) REFERENCES `evenement` (`id_evenement`);

ALTER TABLE `photo`
  ADD CONSTRAINT `photo_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`),
  ADD CONSTRAINT `photo_ibfk_2` FOREIGN KEY (`id_utilisateur_1`) REFERENCES `utilisateur` (`id_utilisateur`),
  ADD CONSTRAINT `photo_ibfk_3` FOREIGN KEY (`id_visionnage`) REFERENCES `visionnage` (`id_visionnage`),
  ADD CONSTRAINT `photo_ibfk_4` FOREIGN KEY (`id_evenement`) REFERENCES `evenement` (`id_evenement`);

ALTER TABLE `visionnage`
  ADD CONSTRAINT `visionnage_ibfk_1` FOREIGN KEY (`id_evenement`) REFERENCES `evenement` (`id_evenement`);

-- Insertion d'un administrateur par défaut
INSERT INTO `utilisateur` (
  `pseudo`,
  `nom`,
  `prenom`,
  `adresse`,
  `cp`,
  `ville`,
  `telephone`,
  `mail`,
  `mdp`,
  `role`,
  `statut`,
  `notif_mail`,
  `statut_cotisation`
) VALUES (
  'admin',             -- pseudo
  'Administrateur',    -- nom
  'Principal',         -- prenom
  '1 Rue de lAdmin',   -- adresse 
  '75000',             -- code postal
  'Paris',             -- ville
  '0102030405',        -- téléphone
  'admin@example.com', -- email
  SHA2('admin123', 256), -- mot de passe haché avec SHA-256
  'admin',             -- rôle
  1,                   -- statut
  1,                   -- notification par mail
  1                    -- statut de cotisation
);

-- Validation des modifications
COMMIT;