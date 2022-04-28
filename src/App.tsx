import './App.css';
import DiagramPage from './components/DiagramPage/DiagramPage';
import HomePage from './components/HomePage';
import { BrowserRouter, Routes, Route} from 'react-router-dom';

const App = () => {
  return (
    <div className="app">
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='diagram/:id' element={<DiagramPage />} />
            </Routes>
        </BrowserRouter>   
    </div>
  );
}

export default App;
