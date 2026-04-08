export interface Position {
  x: number;
  y: number;
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
  addTile: (tile: Omit<TileData, 'id'>) => void;
  updateTilePosition: (id: string, position: Position) => void;
  updateTile: (id: string, updates: Partial<TileData>) => void;
  removeTile: (id: string) => void;
  selectTile: (id: string | null) => void;
  openDiagram: (diagramId: string) => void;
  closeDiagram: () => void;
  openSubItem: (item: TileSubItem) => void;
  closeSubItem: () => void;
}
