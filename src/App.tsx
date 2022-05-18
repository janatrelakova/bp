import './App.css';
import DiagramPage from './components/DiagramPage/DiagramPage';
import HomePage from './components/HomePage';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import DiagramsGrid from './components/MainPage/DiagramsGrid';
import WelcomePage from './components/WelcomePage';
import MainPage from './components/MainPage/MainPage';

const App = () => {
  return (
    <div className="app">
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<WelcomePage />} />
                <Route path='diagram/:id' element={<DiagramPage />} />
                <Route path='/DiagramsPage/diagrams/:id' element={<HomePage />} />
            </Routes>
        </BrowserRouter>   
    </div>
  );
}

export default App;
