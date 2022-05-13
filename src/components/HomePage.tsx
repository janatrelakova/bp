import * as React from 'react';
import MainPage from './MainPage/MainPage';
import SidePanel from './SidePanel/SidePanel';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-page">
            <SidePanel />
            <MainPage />
        </div>
    );
};

export default HomePage;