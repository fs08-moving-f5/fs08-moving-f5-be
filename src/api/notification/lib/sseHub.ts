import { Response } from 'express';

const sseClientsByUserId = new Map<string, Set<Response>>();

export const addSseClient = (userId: string, res: Response) => {
  const clients = sseClientsByUserId.get(userId) ?? new Set<Response>();
  clients.add(res);
  sseClientsByUserId.set(userId, clients);
};

export const removeSseClient = (userId: string, res: Response) => {
  const clients = sseClientsByUserId.get(userId);
  if (!clients) return;

  clients.delete(res);
  if (clients.size === 0) {
    sseClientsByUserId.delete(userId);
  }
};

export const pushSseEvent = (userId: string, eventName: string, data: unknown) => {
  const clients = sseClientsByUserId.get(userId);
  if (!clients) return;

  const payload = `event: ${eventName}\n` + `data: ${JSON.stringify(data)}\n\n`;

  for (const res of clients) {
    try {
      res.write(payload);
    } catch {}
  }
};
