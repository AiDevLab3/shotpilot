// Force module reload: 2026-02-06T14:00
import './services/api';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log("SHOTPILOT: Main script v3");
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
