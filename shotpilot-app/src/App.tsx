import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { useStore } from './store';
import { seedDemoData } from './services/demoSeeder';

function App() {
  const hasProjects = useStore(state => Object.keys(state.projects).length > 0);

  useEffect(() => {
    // Seed data if empty (Simulator/Driver integration)
    if (!hasProjects) {
      console.log("Seeding demo data...");
      seedDemoData();
    }
  }, [hasProjects]);

  return (
    <Layout />
  );
}

export default App;
