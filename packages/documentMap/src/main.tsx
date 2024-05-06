import React from 'react';
import ReactDOM from 'react-dom/client';
import { DocumentMapProps, DocumentMap } from './documentMap.js';

const config: DocumentMapProps = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 2,
  resourceId: import.meta.env.VITE_RESOURCE_ID || 1,
  login: {
    url: `${import.meta.env.VITE_API_URL}/auth/project/${import.meta.env.VITE_PROJECT_ID}/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
    anonymous: {
      url: `${import.meta.env.VITE_API_URL}/auth/project/${import.meta.env.VITE_PROJECT_ID}/login?forceNewLogin=1&useAuth=anonymous&redirectUri=${document.location}`,
    },
  },
  documentUrl: 'https://fastly.picsum.photos/id/48/1920/1080.jpg?hmac=r2li6k6k9q34DhZiETPlmLsPPGgOChYumNm6weWMflI',
  documentHeight: 1080,
  documentWidth: 1920,
  zoom: 0
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DocumentMap {...config} />
  </React.StrictMode>
);
