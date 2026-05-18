import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import App from './App';
import './styles/theme.css';
import './styles/components.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
