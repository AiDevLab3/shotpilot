import ReactDOM from 'react-dom/client';
// v2: Single-page workbench (core loop)
// To revert to v1: change AppV2 back to App
import AppV2 from './AppV2';
import './index.css';

console.log("SHOTPILOT: Main script v2.0 — Core Loop");
ReactDOM.createRoot(document.getElementById('root')!).render(<AppV2 />);
