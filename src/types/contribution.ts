export interface ContributionComponent {
  label: string;
  filePath: string;
  line: number;
  description: string;
}

export interface ContributionPayload {
  type: 'new-tile' | 'add-sub-item';
  tileTitle?: string;
  targetTileId?: string;
  component: ContributionComponent;
}

export interface Contribution {
  id: string;
  timestamp: number;
  payload: ContributionPayload;
  assignedTileId?: string;
}

export type ServerMessage =
  | { type: 'replay'; contributions: Contribution[]; deletedTileIds: string[] }
  | { type: 'new-contribution'; contribution: Contribution }
  | { type: 'tile-deleted'; tileId: string }
  | { type: 'tile-list'; tiles: Array<{ id: string; title: string }> };

export type ClientMessage =
  | { type: 'contribute'; payload: ContributionPayload }
  | { type: 'delete-tile'; tileId: string }
  | { type: 'request-tile-list' };
