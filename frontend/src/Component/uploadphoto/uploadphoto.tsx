import React, { useState, useEffect } from 'react'; 
import './uploadphoto.css';
import { upload } from '@testing-library/user-event/dist/upload';
import axios from 'axios';

interface uploadphotoProps {
    setPage: any;
}

const Uploadphoto: React.FC<uploadphotoProps> = ({ setPage }) => {
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [nomphoto, setNomphoto] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [photographe, setPhotographe] = useState<string>("");
    const [users, setUsers] = useState<any[]>([]);

    const upload = async () => {
        console.log("upload");
        const token = localStorage.getItem('phototoken');
        try {
            const response = await axios.get('http://localhost:5000/GET/verify-token', {
              params: {
                token: token
              }
            });
            if (response.data.valid === false) {
                setPage(5);
            }
        } catch {
            console.log("token invalide");
        }
        
        const formData = new FormData();
        const photo = (document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement).files?.[0];
        const exif = (document.querySelector('input[type="file"][accept=".exif"]') as HTMLInputElement).files?.[0];

        if (photo) formData.append('photo', photo);
        if (exif) formData.append('exif', exif);

        formData.append('info', JSON.stringify({
            nom: nomphoto,
            nomphoto: nomphoto,
            description: description,
            isPublic: isPublic,
            photographe: photographe
        }));
        formData.append('token', token || '');

        try {
            const response = await axios.post('http://localhost:5000/POST/upload-photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
            });
            console.log(response.data);
        } catch (error) {
            console.error('Error uploading photo:', error);
        }

    };
                    
    useEffect(() => {
        const fetchUsers = async () => {
        const token = localStorage.getItem('phototoken');
        try {
            const response = await axios.get('http://localhost:5000/GET/users', {
                params: { token: token }
            });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
            };

            fetchUsers();
            console.log('users:', users);
        }, []);
    
    return (
        <div className='uploadphoto'>
            <h1>Uploadphoto</h1>
            <input placeholder='photo' type="file" accept="image/*" onChange={(e) => {
                const photo = e.target.files?.[0];
                if (photo) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        console.log(reader.result);
                    };
                    reader.readAsDataURL(photo);
                }}} />
                <input placeholder='exif' type="file" accept=".exif" onChange={(e) => {
                    const exif = e.target.files?.[0];
                    if (exif) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            console.log(reader.result);
                        };
                        reader.readAsDataURL(exif);
                    }
                }} />

                <input type="text" placeholder="Nom de la photo" value={nomphoto} onChange={(e) => setNomphoto(e.target.value)} />
                <select value={photographe} onChange={(e) => {
                    setPhotographe(e.target.value);
                }}>
                    <option value="" disabled>Select a user</option>
                    {users.map(user => (
                        <option key={user.id_utilisateur} value={user.id_utilisateur}>
                            {user.nom}
                        </option>
                    ))}
                </select>
                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Public
            <button onClick={upload}>valider</button>
        </div>
    );
}

export default Uploadphoto;
