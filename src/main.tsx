import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { register } from './serviceWorkerRegistration';

createRoot(document.getElementById("root")!).render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
register();
