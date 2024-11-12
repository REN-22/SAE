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

    return (
        <header className="header">
            <div className="logo">
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
                    <li><a href="#" onClick={() => setPage(5)}>connexion</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default HeaderPublic;