import { BrightnessBody, MatteBody, SelectArtBody, ServerStatus, UploadMeta } from '@framesync/shared';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import multer from 'multer';
import { z } from 'zod';
import { FrameService } from './frameService.js';

const PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 4000;
const HOST = process.env.FRAME_TV_HOST || '';
const PORT_TV = process.env.FRAME_TV_PORT ? Number(process.env.FRAME_TV_PORT) : 8002;
const DEVICE_NAME = process.env.DEVICE_NAME || 'FrameSync';
const DEVICE_ID = process.env.DEVICE_ID || undefined;

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
const upload = multer();

const frame = new FrameService({ host: HOST, port: PORT_TV, deviceName: DEVICE_NAME, deviceId: DEVICE_ID });

app.get('/api/status', async (_req, res) => {
  const body = { ok: true, tvConnected: frame.isConnected(), host: HOST };
  res.json(body satisfies z.infer<typeof ServerStatus>);
});

app.post('/api/connect', async (_req, res) => {
  try {
    await frame.connect();
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: 'connect_failed', details: err?.message });
  }
});

app.post('/api/power/on', async (_req, res) => {
  try {
    await frame.powerOn();
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: 'power_on_failed', details: err?.message });
  }
});

app.post('/api/power/off', async (_req, res) => {
  try {
    await frame.powerOff();
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: 'power_off_failed', details: err?.message });
  }
});

app.get('/api/art', async (_req, res) => {
  try {
    const items = await frame.listArt();
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: 'list_art_failed', details: err?.message });
  }
});

app.post('/api/art/select', async (req, res) => {
  try {
    const body = SelectArtBody.parse(req.body);
    await frame.selectArt(body.id);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ error: 'select_art_failed', details: err?.message });
  }
});

app.post('/api/art/brightness', async (req, res) => {
  try {
    const body = BrightnessBody.parse(req.body);
    await frame.setBrightness(body.value);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ error: 'brightness_failed', details: err?.message });
  }
});

app.post('/api/art/matte', async (req, res) => {
  try {
    const body = MatteBody.parse(req.body);
    await frame.setMatte(body.style);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ error: 'matte_failed', details: err?.message });
  }
});

app.post('/api/art/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'missing_file' });
    }
    const meta = UploadMeta.optional().parse(req.body?.meta ? JSON.parse(String(req.body.meta)) : undefined);
    const result = await frame.uploadArt(req.file.buffer, meta);
    res.status(201).json({ status: 'queued', id: result.id });
  } catch (err: any) {
    res.status(400).json({ error: 'upload_failed', details: err?.message });
  }
});

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(`data: ${JSON.stringify({ type: 'hello' })}\n\n`);
  req.on('close', () => {
    // cleanup
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`FrameSync server listening on http://localhost:${PORT}`);
});
