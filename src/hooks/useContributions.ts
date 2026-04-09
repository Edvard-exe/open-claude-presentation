import { useEffect, useRef } from 'react';
import { useBoardStore } from '../store/boardStore';
import type { Contribution, ServerMessage } from '../types/contribution';

const appliedIds = new Set<string>();

// Module-level WS ref so deleteTilePermanently can send messages
let activeWs: WebSocket | null = null;

export function deleteTilePermanently(tileId: string): void {
  useBoardStore.getState().removeTile(tileId);
  if (activeWs && activeWs.readyState === WebSocket.OPEN) {
    activeWs.send(JSON.stringify({ type: 'delete-tile', tileId }));
  }
}
const SRC_BASE = '/Users/edvardsivickij/Documents/claude code/src/';

function toAbsolutePath(filePath: string): string {
  // Already absolute
  if (filePath.startsWith('/')) return filePath;
  // Strip leading src/ if present — we add it via SRC_BASE
  const cleaned = filePath.replace(/^src\//, '');
  return SRC_BASE + cleaned;
}

const CONTRIB_COLORS = ['#10B981', '#EC4899', '#F59E0B', '#6366F1', '#14B8A6', '#8B5CF6'];
let colorIdx = 0;

function nextColor(): string {
  return CONTRIB_COLORS[colorIdx++ % CONTRIB_COLORS.length];
}

function computeNextPosition() {
  const tiles = useBoardStore.getState().tiles;
  if (tiles.length === 0) return { x: 200, y: 150 };
  let maxRight = 0;
  let yAtMax = 150;
  for (const t of tiles) {
    const right = t.position.x + t.width;
    if (right > maxRight) {
      maxRight = right;
      yAtMax = t.position.y;
    }
  }
  return { x: maxRight + 80, y: yAtMax };
}

function applyContribution(c: Contribution): void {
  if (appliedIds.has(c.id)) return;
  appliedIds.add(c.id);

  const { payload, assignedTileId } = c;
  const store = useBoardStore.getState();

  if (payload.type === 'new-tile' && assignedTileId) {
    if (store.tiles.some((t) => t.id === assignedTileId)) return;
    const pos = computeNextPosition();
    const color = nextColor();
    useBoardStore.setState((state) => ({
      tiles: [
        ...state.tiles,
        {
          id: assignedTileId,
          position: pos,
          width: 360,
          height: 300,
          title: payload.tileTitle || 'Contributed Topic',
          color,
          animated: true,
          subItems: [
            {
              label: payload.component.label,
              description: payload.component.description,
              filePath: toAbsolutePath(payload.component.filePath),
              line: payload.component.line || undefined,
              color,
            },
          ],
        },
      ],
    }));
  } else if (payload.type === 'add-sub-item' && payload.targetTileId) {
    const tile = store.tiles.find((t) => t.id === payload.targetTileId);
    if (!tile) return;
    const existing = tile.subItems || [];
    store.updateTile(payload.targetTileId, {
      subItems: [
        ...existing,
        {
          label: payload.component.label,
          description: payload.component.description,
          filePath: toAbsolutePath(payload.component.filePath),
          line: payload.component.line || undefined,
          color: tile.color || '#10B981',
        },
      ],
    });
  }
}

export function useContributions(): void {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let attempt = 0;

    function connect() {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${location.host}/ws/contribute`);
      wsRef.current = ws;

      ws.onopen = () => {
        attempt = 0;
        activeWs = ws;
      };

      ws.onmessage = (event) => {
        const msg: ServerMessage = JSON.parse(event.data);

        if (msg.type === 'replay') {
          for (const c of msg.contributions) {
            applyContribution(c);
          }
          // Remove deleted tiles
          if (msg.deletedTileIds?.length) {
            for (const id of msg.deletedTileIds) {
              useBoardStore.getState().removeTile(id);
            }
          }
        } else if (msg.type === 'new-contribution') {
          applyContribution(msg.contribution);
        } else if (msg.type === 'tile-deleted') {
          useBoardStore.getState().removeTile(msg.tileId);
        }
      };

      ws.onclose = () => {
        activeWs = null;
        const delay = Math.min(1000 * 2 ** attempt, 10000);
        attempt++;
        reconnectTimer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);
}
