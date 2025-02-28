import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './pagePrésentation.css';

const PagePrésentation: React.FC = () => {
    const [photos, setPhotos] = useState<{ id: number, imageUrl: string }[]>([]);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await axios.get('http://backend:5000/GET/random-photos');
                const data = response.data;
                const photoPromises = data.map((photo: any) => fetchPhotoById(photo.id_photo));
                const photos = await Promise.all(photoPromises);
                setPhotos(photos.filter(photo => photo !== null) as { id: number, imageUrl: string }[]);
                console.log('Data:', data);
                console.log('Photos:', photos);
            } catch (error) {
                console.error('Error fetching photos:', error);
            }
        };
        fetchPhotos();
    }, []);
    const fetchPhotoById = async (id: number) => {
        try {
            const response = await axios.get(`http://localhost:5000/GET/photo/filemin?id=${id}`, {
                responseType: 'blob',
            });
            const imageUrl = URL.createObjectURL(response.data);
            return { id, imageUrl };
        } catch (error) {
            console.error(`Error fetching photo with id ${id}:`, error);
            return null;
        }
    };

    return (
        <div className="presentation-container">
            <h1>Bienvenue dans Notre Club</h1>
            <p>
                Notre Club est dédiée à [insérer mission ou objectif du Club]. 
                Nous nous efforçons de [insérer activités du Club].
            </p>
            <h2>Nos Valeurs</h2>
            <ul>
                <li>Valeur 1</li>
                <li>Valeur 2</li>
                <li>Valeur 3</li>
            </ul>
            <h2>Nos Activités</h2>
            <p>
                Nous organisons régulièrement des événements tels que [insérer types d'événements] 
                pour [insérer but des événements].
            </p>
            <h2>Photos</h2>
            <div className="photos-container">
                {photos.map((photo) => (
                    <img key={photo.id} src={photo.imageUrl} alt={`numéro ${photo.id}`} />
                ))}
            </div>
        </div>
    );
};

export default PagePrésentation;