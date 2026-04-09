import { WebSocketServer, WebSocket } from 'ws';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import os from 'node:os';
import { nanoid } from 'nanoid';
import type { Plugin, ViteDevServer } from 'vite';
import type { Contribution, ContributionPayload, ServerMessage } from '../types/contribution';

const INITIAL_TILES = [
  { id: 'tile-core-architecture', title: 'Core Architecture' },
  { id: 'tile-agent-system', title: 'Agent System' },
  { id: 'tile-caching', title: 'Prompt Caching' },
  { id: 'tile-mailbox', title: 'Agent Mailbox' },
  { id: 'tile-hooks', title: 'Hooks' },
  { id: 'tile-compaction', title: 'Compaction' },
];

function readContributions(path: string): Contribution[] {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return [];
  }
}

function writeContributions(path: string, contributions: Contribution[]): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(contributions, null, 2));
}

function broadcast(wss: WebSocketServer, msg: ServerMessage): void {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

function getTileList(contributions: Contribution[]): Array<{ id: string; title: string }> {
  const tiles = [...INITIAL_TILES];
  for (const c of contributions) {
    if (c.payload.type === 'new-tile' && c.assignedTileId && c.payload.tileTitle) {
      tiles.push({ id: c.assignedTileId, title: c.payload.tileTitle });
    }
  }
  return tiles;
}

function detectContributeUrl(port: number): string {
  // 1. Try Tailscale — get the machine's DNS name
  try {
    const out = execSync('tailscale status --json', { timeout: 3000, encoding: 'utf-8' });
    const status = JSON.parse(out);
    const dnsName = status?.Self?.DNSName;
    if (dnsName) {
      // DNSName has a trailing dot, remove it
      const host = dnsName.replace(/\.$/, '');
      return `https://${host}`;
    }
  } catch {
    // Tailscale not installed or not running
  }

  // 2. Fall back to LAN IP
  const interfaces = os.networkInterfaces();
  for (const addrs of Object.values(interfaces)) {
    for (const addr of addrs || []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return `http://${addr.address}:${port}`;
      }
    }
  }

  return `http://localhost:${port}`;
}

export function contributePlugin(): Plugin {
  return {
    name: 'contribute-ws',
    configureServer(server: ViteDevServer) {
      const dataFile = resolve(server.config.root, 'data/contributions.json');
      let contributions = readContributions(dataFile);
      const port = server.config.server.port || 5173;
      const contributeBaseUrl = detectContributeUrl(port);

      // REST endpoint: contribute URL for QR code
      server.middlewares.use('/api/contribute-url', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ url: `${contributeBaseUrl}/contribute/` }));
      });

      console.log(`[contribute-ws] QR url: ${contributeBaseUrl}/contribute/`);

      const wss = new WebSocketServer({ noServer: true });

      server.httpServer?.on('upgrade', (req, socket, head) => {
        if (req.url === '/ws/contribute') {
          wss.handleUpgrade(req, socket as never, head, (ws) => {
            wss.emit('connection', ws, req);
          });
        }
      });

      wss.on('connection', (ws) => {
        ws.send(JSON.stringify({ type: 'replay', contributions, deletedTileIds: [] }));
        ws.send(JSON.stringify({ type: 'tile-list', tiles: getTileList(contributions) }));

        ws.on('message', (raw) => {
          try {
            const msg = JSON.parse(raw.toString());

            if (msg.type === 'request-tile-list') {
              ws.send(JSON.stringify({ type: 'tile-list', tiles: getTileList(contributions) }));
              return;
            }

            if (msg.type === 'delete-tile') {
              const tileId = msg.tileId as string;
              const idx = contributions.findIndex(
                (c) => c.assignedTileId === tileId,
              );
              if (idx !== -1) {
                contributions.splice(idx, 1);
                writeContributions(dataFile, contributions);
              }
              broadcast(wss, { type: 'tile-deleted', tileId });
              return;
            }

            if (msg.type === 'contribute') {
              const payload = msg.payload as ContributionPayload;
              const contribution: Contribution = {
                id: nanoid(),
                timestamp: Date.now(),
                payload,
              };

              if (payload.type === 'new-tile') {
                contribution.assignedTileId = `tile-contrib-${contribution.id}`;
              }

              contributions.push(contribution);
              writeContributions(dataFile, contributions);

              broadcast(wss, { type: 'new-contribution', contribution });
              broadcast(wss, { type: 'tile-list', tiles: getTileList(contributions) });
            }
          } catch (e) {
            console.error('[contribute-ws] message error:', e);
          }
        });
      });
    },
  };
}
