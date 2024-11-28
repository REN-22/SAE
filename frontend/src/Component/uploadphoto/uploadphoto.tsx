import React, { useState, useEffect } from 'react';
import './uploadphoto.css';
import axios from 'axios';

interface UploadphotoProps {
    setPage: any;
}

const Uploadphoto: React.FC<UploadphotoProps> = ({ setPage }) => {
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [nomphoto, setNomphoto] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [photographe, setPhotographe] = useState<string>("");
    const [users, setUsers] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [filteredTags, setFilteredTags] = useState<any[]>([]);
    const [selectedTags, setSelectedTags] = useState<any[]>([]);

    const handleUpload = async () => {
        console.log("upload");
        const token = localStorage.getItem('phototoken');
        try {
            const response = await axios.get('http://localhost:5000/GET/verify-token', {
                params: { token }
            });
            if (!response.data.valid) {
                setPage(5);
                return;
            }
        } catch {
            console.log("token invalide");
            return;
        }

        const formData = new FormData();
        const photo = (document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement).files?.[0];
        const exif = (document.querySelector('input[type="file"][accept=".exif"]') as HTMLInputElement).files?.[0];

        if (photo) formData.append('photo', photo);
        if (exif) formData.append('exif', exif);

        formData.append('info', JSON.stringify({
            nom: nomphoto,
            description,
            isPublic,
            photographe,
            tags: selectedTags.map(tag => tag.id_mot_cle), // On envoie les IDs des tags sélectionnés
        }));
        formData.append('token', token ?? '');

        try {
            const response = await axios.post('http://localhost:5000/POST/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log("réponse", response.data);
            setPage(1);
        } catch (error) {
            console.error('Error uploading photo:', error);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('phototoken');
            try {
                const response = await axios.get('http://localhost:5000/GET/users', {
                    params: { token }
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchTags = async () => {
            const token = localStorage.getItem('phototoken');
            try {
                const response = await axios.get('http://localhost:5000/GET/tags', {
                    params: { token }
                });
                setTags(response.data);
                setFilteredTags(response.data); // Initialisation des tags à afficher
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        fetchTags();
    }, []);

    const handleTagSearch = (searchTerm: string) => {
        setFilteredTags(tags.filter(tag =>
            tag.texte.toLowerCase().includes(searchTerm.toLowerCase()) // Filtrage des tags en fonction de la recherche
        ));
    };

    const handleTagSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        const tagselec = tags.filter(tag => selectedOptions.includes(tag.texte));
        setSelectedTags(prevSelectedTags => addNewTags(prevSelectedTags, tagselec));
        console.log("selectedTags", selectedTags);
    };

    const addNewTags = (prevSelectedTags: any[], tagselec: any[]) => {
        const newTags = tagselec.filter(tag => !prevSelectedTags.some(selectedTag => selectedTag.id_mot_cle === tag.id_mot_cle));
        return [...prevSelectedTags, ...newTags];
    };

    const handleRemoveTag = (tagId: number) => {
        setSelectedTags(prev => prev.filter(tag => tag.id_mot_cle !== tagId));
    };

    return (
        <div className='uploadphoto'>
            <h1>Uploadphoto</h1>
            <input type="file" accept="image/*" />
            <input type="file" accept=".exif" />
            <input
                type="text"
                placeholder="Nom de la photo"
                value={nomphoto}
                onChange={(e) => setNomphoto(e.target.value)}
            />
            <select value={photographe} onChange={(e) => setPhotographe(e.target.value)}>
                <option value="" disabled>Choisir un photographe</option>
                {users.map(user => (
                    <option key={user.id_utilisateur} value={user.id_utilisateur}>
                        {user.nom}
                    </option>
                ))}
            </select>

            {/* Affichage des tags sélectionnés avec un bouton pour les supprimer */}
            <div className="selected-tags">
                {selectedTags.map(tag => (
                    <div key={tag.id_mot_cle} className="selected-tag">
                        {tag.texte}
                        <button onClick={() => handleRemoveTag(tag.id_mot_cle)}>×</button>
                    </div>
                ))}
            </div>

            {/* Barre de recherche pour filtrer les tags */}
            <input
                type="text"
                placeholder="Rechercher des tags"
                onChange={(e) => handleTagSearch(e.target.value)}
            />

            {/* Liste des tags sous forme de select multiple */}
            <select
                multiple
                value={selectedTags.map(tag => tag.texte)} // On affiche les tags sélectionnés
                onChange={handleTagSelect}
                size={5}  // Affiche jusqu'à 5 options visibles
            >
                {filteredTags.map(tag => (
                    <option key={tag.id_mot_cle} value={tag.texte}>
                        {tag.texte}
                    </option>
                ))}
            </select>
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <label>
                <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                /> Public
            </label>
            <button onClick={handleUpload}>Valider</button>
        </div>
    );
};

export default Uploadphoto;
