import { Board } from './components/Board/Board';
import { Toolbar } from './components/Toolbar/Toolbar';
import { PresentationBar } from './components/PresentationBar/PresentationBar';
import { DiagramOverlay } from './components/DiagramOverlay/DiagramOverlay';
import { SubItemOverlay } from './components/SubItemOverlay/SubItemOverlay';
import './App.css';

function App() {
  return (
    <>
      <Board />
      <Toolbar />
      <PresentationBar />
      <DiagramOverlay />
      <SubItemOverlay />
    </>
  );
}

export default App;
