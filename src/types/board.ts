export interface Position {
  x: number;
  y: number;
}

export interface AnimationStep {
  tileId: string;
  connectionIndex: number | null;
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

  setPan: (pan: Position) => void;
  setZoom: (zoom: number) => void;
  updateTilePosition: (id: string, position: Position) => void;
  updateTile: (id: string, updates: Partial<TileData>) => void;
  removeTile: (id: string) => void;
  selectTile: (id: string | null) => void;
  openDiagram: (diagramId: string) => void;
  closeDiagram: () => void;
  openSubItem: (item: TileSubItem) => void;
  closeSubItem: () => void;

  // Presentation playback
  presentationActive: boolean;
  presentationStepIndex: number;
  presentationTransitioning: boolean;
  activeTileId: string | null;
  activeConnectionIndex: number | null;

  startPresentation: () => void;
  stopPresentation: () => void;
  presentationNext: () => void;
  presentationPrev: () => void;
  goToStep: (index: number) => void;
  setPresentationTransitioning: (v: boolean) => void;
}
