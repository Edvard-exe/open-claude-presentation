import { Board } from './components/Board/Board';
import { Toolbar } from './components/Toolbar/Toolbar';
import { PresentationBar } from './components/PresentationBar/PresentationBar';
import { DiagramOverlay } from './components/DiagramOverlay/DiagramOverlay';
import { SubItemOverlay } from './components/SubItemOverlay/SubItemOverlay';
import { QROverlay } from './components/QROverlay/QROverlay';
import { useContributions } from './hooks/useContributions';
import './App.css';

function App() {
  useContributions();

  return (
    <>
      <Board />
      <Toolbar />
      <PresentationBar />
      <DiagramOverlay />
      <SubItemOverlay />
      <QROverlay />
    </>
  );
}

export default App;
