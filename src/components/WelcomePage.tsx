import * as React from 'react';
import UsersGrid from './MainPage/UsersGrid';
import './WelcomePage.css';

const WelcomePage = () => {
    return (
        <div className="welcome-page">
            <span className="welcome-page__title">Collaborative Model Editor</span>
            <span className="welcome-page__subtitle">Choose an account</span>
            <UsersGrid />
        </div>
    );
};

export default WelcomePage;