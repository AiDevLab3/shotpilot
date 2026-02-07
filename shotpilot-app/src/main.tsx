// autoAuth is a NEW file — cannot be browser-cached
import './services/autoAuth';
import './services/api';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log("SHOTPILOT: Main script v4");
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
