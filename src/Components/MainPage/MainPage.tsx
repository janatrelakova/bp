import * as React from 'react';
import DiagramsGrid from './DiagramsGrid';
import './MainPage.css';
import Header from './Header';

const MainPage = () => {
    return (
        <div className="main">
            <Header />
            <DiagramsGrid />
        </div>
    );
}

export default MainPage;