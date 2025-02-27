import React, { useState } from 'react';
import './header.css';

interface HeaderPublicProps {
    setPage: (page: number) => void;
}

const HeaderPublic: React.FC<HeaderPublicProps> = ({ setPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogoClick = () => {
        setPage(0); // Redirige vers la page 1 lorsque l'image du logo est cliquée
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
                    <li><button onClick={() => setPage(3)}>Inscription</button></li>
                    <li><button onClick={() => setPage(5)}>Connexion</button></li>
                </ul>
            </nav>
        </header>
    );
};

export default HeaderPublic;