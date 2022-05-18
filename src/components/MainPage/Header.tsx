import './Header.css';

import * as React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <div className="header">
            <Link to={`/`}>
                <span className="header__link">Collaborative Model Editor</span>
            </Link>            
        </div>
    );
}

export default Header;