#!/bin/bash

# Demander à l'utilisateur de saisir l'email et le mot de passe de l'administrateur
read -p "Veuillez entrer l'email de l'administrateur : " admin_email
read -s -p "Veuillez entrer le mot de passe de l'administrateur : " admin_password
echo

# Vérifier que les variables ne sont pas vides
if [[ -z "$admin_email" || -z "$admin_password" ]]; then
  echo "L'email et le mot de passe ne peuvent pas être vides. Veuillez relancer le script."
  exit 1
fi

# Mettre à jour le fichier init.sql avec les nouvelles informations
sed -i "s/'admin@example.com'/'$admin_email'/g" init.sql
sed -i "s/SHA2('admin123', 256)/SHA2('$admin_password', 256)/g" init.sql

# Mettre à jour les paquets et installer les dépendances
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Ajouter la clé GPG officielle de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Ajouter le repository Docker
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Installer Docker
sudo apt-get update
sudo apt-get install -y docker-ce

# Ajouter l'utilisateur au groupe Docker pour exécuter Docker sans sudo (facultatif)
sudo usermod -aG docker ${USER}

# Installer Docker Compose
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")')
if [ -z "$DOCKER_COMPOSE_VERSION" ]; then
  echo "Failed to fetch Docker Compose version."
  exit 1
fi
sudo curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Construire et démarrer les conteneurs Docker
docker-compose up -d --build
