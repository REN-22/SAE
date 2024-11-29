import React, { useState } from 'react';
import './header.css';

interface HeaderInterneProps {
    setPage: (page: number) => void;
}

const HeaderInterne: React.FC<HeaderInterneProps> = ({ setPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('phototoken');
        setPage(5);
    }

    const handleLogoClick = () => {
        setPage(1); // Redirige vers la page 1 lorsque l'image du logo est cliquée
    }

    return (
        <header className="header">
            <div className="logo" onClick={handleLogoClick}>
                <img src={require('../../images/logo.png')} alt="Club Logo" />
            </div>

            {/* Menu burger visible uniquement sur petits écrans */}
            <div className="burger-menu" onClick={toggleMenu}>
                <div className={`burger-bar ${isMenuOpen ? 'open' : ''}`}></div>
                <div className={`burger-bar ${isMenuOpen ? 'open' : ''}`}></div>
                <div className={`burger-bar ${isMenuOpen ? 'open' : ''}`}></div>
            </div>

            {/* Navigation toujours visible sur grand écran et contrôlée par burger sur petits écrans */}
            <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
                <ul>
                    <li><a href="#" onClick={() => setPage(2)}>Profile</a></li>
                    <li><a href="#" onClick={() => setPage(1)}>Settings</a></li>
                    <li><a href="#" onClick={() => setPage(3)}>inscription</a></li>
                    <li><a href="#" onClick={handleLogout}>déconnexion</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default HeaderInterne;
