import React, { useState } from 'react'; 
import './uploadphoto.css';
import { upload } from '@testing-library/user-event/dist/upload';

interface uploadphotoProps {
    setPage: any;
}

const Uploadphoto: React.FC<uploadphotoProps> = ({ setPage }) => {
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [nomphoto, setNomphoto] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const upload = () => {
        console.log("upload");
    }

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
                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Public
            <button onClick={upload}>valider</button>
        </div>
    );
}

export default Uploadphoto;
