export interface Position {
  x: number;
  y: number;
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
  diagramId?: string;
  animated?: boolean;
}

export interface BoardState {
  pan: Position;
  zoom: number;
  tiles: TileData[];
  selectedTileId: string | null;
  openDiagramId: string | null;

  setPan: (pan: Position) => void;
  setZoom: (zoom: number) => void;
  addTile: (tile: Omit<TileData, 'id'>) => void;
  updateTilePosition: (id: string, position: Position) => void;
  updateTile: (id: string, updates: Partial<TileData>) => void;
  removeTile: (id: string) => void;
  selectTile: (id: string | null) => void;
  openDiagram: (diagramId: string) => void;
  closeDiagram: () => void;
}
