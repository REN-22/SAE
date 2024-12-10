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
            <button className="burger-menu" onClick={toggleMenu} onKeyDown={(e) => { if (e.key === 'Enter') toggleMenu(); }}>
                <div className={`burger-bar ${isMenuOpen ? 'open' : ''}`}></div>
                <div className={`burger-bar ${isMenuOpen ? 'open' : ''}`}></div>
                <div className={`burger-bar ${isMenuOpen ? 'open' : ''}`}></div>
            </button>

            {/* Navigation toujours visible sur grand écran et contrôlée par burger sur petits écrans */}
            <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
                <ul>
<<<<<<< HEAD
                    <li><a href="#" onClick={() => setPage(2)}>Profile</a></li>
                    <li><a href="#" onClick={() => setPage(1)}>Settings</a></li>
                    <li><a href="#" onClick={() => setPage(3)}>inscription</a></li>
                    <li><a href="#" onClick={handleLogout}>déconnexion</a></li>
=======
                    <li><button onClick={() => setPage(7)}>evenement</button></li>
                    <li><button onClick={() => setPage(1)}>Profile</button></li>
                    <li><button onClick={() => setPage(1)}>options</button></li>
                    <li><button onClick={handleLogout}>déconnexion</button></li>
>>>>>>> b18e6bf5ddc67686bef89de95d5e587dccd77a23
                </ul>
            </nav>
        </header>
    );
};

export default HeaderInterne;
