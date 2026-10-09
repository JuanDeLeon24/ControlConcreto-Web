import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Tunel3D } from './components/Tunel3D';
import { Registro } from './components/Registro';
import { Importar } from './components/Importar';
import { Monitoreo } from './components/Monitoreo';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tunel':
        return <Tunel3D />;
      case 'registro':
        return <Registro />;
      case 'importar':
        return <Importar />;
      case 'monitoreo':
        return <Monitoreo />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default App;
