import type { Position } from '../types/board';

export function screenToWorld(
  screenPos: Position,
  pan: Position,
  zoom: number
): Position {
  return {
    x: (screenPos.x - pan.x) / zoom,
    y: (screenPos.y - pan.y) / zoom,
  };
}

export function worldToScreen(
  worldPos: Position,
  pan: Position,
  zoom: number
): Position {
  return {
    x: worldPos.x * zoom + pan.x,
    y: worldPos.y * zoom + pan.y,
  };
}
