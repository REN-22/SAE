import React, { useState, useEffect } from 'react';
import './header.css';
import axios from 'axios';

interface HeaderInterneProps {
    setPage: (page: number) => void;
}

const HeaderInterne: React.FC<HeaderInterneProps> = ({ setPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const token = localStorage.getItem('phototoken');

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('phototoken');
        setPage(5);
    }

    const handleLogoClick = () => {
        setPage(0); // Redirige vers la page 1 lorsque l'image du logo est cliquée
    }

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('http://localhost:5000/GET/user-role', {
                    params: {
                        token: token
                    }
                });
                const role = response.data.role;
                if (role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }
    , [token]);

    return (
        <header className="header">
            <div className="logo" onClick={handleLogoClick}>
                <img src={require('../../images/logo.png')} alt="Club Logo" />
            </div>

            {/* Menu burger visible uniquement sur petits écrans */}
            <button className="burger-menu" onClick={toggleMenu} onKeyDown={(e) => { if (e.key === 'Enter') toggleMenu(); }}>
                <div className={`burger-bar ${isMenuOpen ? 'open' : ''}`}></div>
                <div className={`burger-bar ${isMenuOpen ? 'open' : ''}`}></div>
                <div className={`burger-bar ${isMenuOpen ? 'open' : ''}`}></div>
            </button>

            {/* Navigation toujours visible sur grand écran et contrôlée par burger sur petits écrans */}
            <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
                <ul>
                    <li><button onClick={() => setPage(1)}>Fil</button></li>
                    <li><button onClick={() => setPage(7)}>Évènements</button></li>
                    <li><button onClick={() => setPage(6)}>Documents</button></li>
                    <li><button onClick={() => setPage(2)}>Profil</button></li>
                    {/*<li><button onClick={() => setPage(1)}>options</button></li> */}
                    {isAdmin && <li><button onClick={() => setPage(9)}>Administration</button></li>}
                    <li><button onClick={handleLogout}>Déconnexion</button></li>
                </ul>
            </nav>
        </header>
    );
};

export default HeaderInterne;
