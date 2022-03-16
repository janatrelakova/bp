import './App.css';
import MainPage from './Components/MainPage/MainPage';
import SidePanel from './Components/SidePanel/SidePanel';

const App = () => {
  return (
    <div className="App">
        <SidePanel />
        <MainPage />
    </div>
  );
}

export default App;
