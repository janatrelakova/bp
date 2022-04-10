import './App.css';
import DiagramPage from './Components/DiagramPage/DiagramPage';
import HomePage from './Components/HomePage';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import NotFound from './Components/NotFound';



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
