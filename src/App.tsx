import { useState, useEffect } from 'react';
import { Board } from './components/Board/Board';
import { Toolbar } from './components/Toolbar/Toolbar';
import { PresentationBar } from './components/PresentationBar/PresentationBar';
import { DiagramOverlay } from './components/DiagramOverlay/DiagramOverlay';
import { SubItemOverlay } from './components/SubItemOverlay/SubItemOverlay';
import { StoryPage } from './components/StoryPage/StoryPage';
import './App.css';

function App() {
  const [mode, setMode] = useState<'story' | 'board'>('story');

  // Toggle overflow on body for board vs story mode
  useEffect(() => {
    if (mode === 'board') {
      document.body.classList.add('board-mode');
    } else {
      document.body.classList.remove('board-mode');
    }
  }, [mode]);

  return (
    <>
      {/* Mode toggle — fixed top-right */}
      <div style={{
        position: 'fixed', top: 12, right: 16, zIndex: 200,
        display: 'flex', gap: 4, background: 'rgba(10,10,15,0.8)',
        borderRadius: 8, border: '1px solid #2a2a3a', padding: 3,
        backdropFilter: 'blur(8px)',
      }}>
        {(['story', 'board'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              background: mode === m ? 'rgba(201,168,76,0.2)' : 'transparent',
              border: mode === m ? '1px solid #c9a84c' : '1px solid transparent',
              color: mode === m ? '#c9a84c' : '#666',
              padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === 'story' ? (
        <StoryPage />
      ) : (
        <>
          <Board />
          <Toolbar />
          <PresentationBar />
          <DiagramOverlay />
          <SubItemOverlay />
        </>
      )}
    </>
  );
}

export default App;
