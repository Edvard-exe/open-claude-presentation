import { Board } from './components/Board/Board';
import { Toolbar } from './components/Toolbar/Toolbar';
import { PresentationBar } from './components/PresentationBar/PresentationBar';
import { DiagramOverlay } from './components/DiagramOverlay/DiagramOverlay';
import { SubItemOverlay } from './components/SubItemOverlay/SubItemOverlay';
import { StoryOverlay } from './components/StoryOverlay/StoryOverlay';
import { useBoardStore } from './store/boardStore';
import './App.css';

function App() {
  const divedTileId = useBoardStore((s) => s.divedTileId);

  return (
    <>
      <Board />
      <Toolbar />
      <PresentationBar />
      <DiagramOverlay />
      <SubItemOverlay />
      {divedTileId && <StoryOverlay />}
    </>
  );
}

export default App;
