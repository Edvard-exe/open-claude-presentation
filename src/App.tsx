import { Board } from './components/Board/Board';
import { Toolbar } from './components/Toolbar/Toolbar';
import { DiagramOverlay } from './components/DiagramOverlay/DiagramOverlay';
import './App.css';

function App() {
  return (
    <>
      <Board />
      <Toolbar />
      <DiagramOverlay />
    </>
  );
}

export default App;
