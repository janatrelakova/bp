import * as React from 'react';
import DiagramsGrid from './DiagramsGrid';
import './MainPage.css';
import Search from './Search';

const MainPage = () => {
    return (
        <div className="main">
            <Search />
            <DiagramsGrid />
        </div>
    );
}

export default MainPage;