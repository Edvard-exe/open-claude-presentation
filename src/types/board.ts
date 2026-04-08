export interface Position {
  x: number;
  y: number;
}

export interface AnimationStep {
  tileId: string;
  connection: Connection | null;
  label: string;
  codeRef: string;
  description: string;
}

export interface TileSubItem {
  label: string;
  description?: string;
  color?: string;
  filePath?: string;
  line?: number;
}

export interface StoryStep {
  label: string;
  title: string;
  source?: string;
  description: string;
  code?: string;
  codeLang?: 'typescript' | 'python' | 'bash' | 'json';
  terminal?: { command: string; output: string };
  spark?: string;
  footer?: string;
}

export interface TileData {
  id: string;
  position: Position;
  width: number;
  height: number;
  title: string;
  content?: string;
  filePath?: string;
  color?: string;
  url?: string;
  diagramId?: string;
  animated?: boolean;
  backgroundType?: 'neural' | 'orbital' | 'cache' | 'shield' | 'mailbox' | 'hooks' | 'compactor';
  subItems?: TileSubItem[];
  storySteps?: StoryStep[];
}

export interface Connection {
  from: string;
  to: string;
  label?: string;
}

export interface BoardState {
  pan: Position;
  zoom: number;
  tiles: TileData[];
  connections: Connection[];
  selectedTileId: string | null;
  openDiagramId: string | null;
  openSubItemData: TileSubItem | null;
  divedTileId: string | null;

  setPan: (pan: Position) => void;
  setZoom: (zoom: number) => void;
  addTile: (tile: Omit<TileData, 'id'>) => void;
  updateTilePosition: (id: string, position: Position) => void;
  updateTile: (id: string, updates: Partial<TileData>) => void;
  removeTile: (id: string) => void;
  selectTile: (id: string | null) => void;
  openDiagram: (diagramId: string) => void;
  closeDiagram: () => void;
  openSubItem: (item: TileSubItem) => void;
  closeSubItem: () => void;
  diveTile: (id: string) => void;
  undive: () => void;

  // Presentation playback
  presentationActive: boolean;
  presentationStepIndex: number;
  presentationTransitioning: boolean;
  activeTileId: string | null;
  activeConnection: Connection | null;

  startPresentation: () => void;
  stopPresentation: () => void;
  presentationNext: () => void;
  presentationPrev: () => void;
  goToStep: (index: number) => void;
  setPresentationTransitioning: (v: boolean) => void;
}
