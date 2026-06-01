import GlobeView from './components/GlobeView';

function App() {
  const handleLottery = () => {
    // Phase 2: lottery ceremony — placeholder for now
    console.log('לאן טסים? — ceremony coming in Phase 2');
  };

  return <GlobeView onLottery={handleLottery} />;
}

export default App;
