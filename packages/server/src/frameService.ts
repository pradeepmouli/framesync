/*
  FrameService wraps samsung-frame-connect. The exact API surface of the library may differ;
  methods below are implemented with placeholders and should be wired to real calls.
*/

import Pino from 'pino';

export type FrameConfig = {
  host: string;
  port?: number;
  deviceName?: string;
  deviceId?: string;
};

export class FrameService {
  private cfg: FrameConfig;
  private log = Pino({ name: 'FrameService' });
  private connected = false;

  constructor(cfg: FrameConfig) {
    this.cfg = { port: 8002, ...cfg };
  }

  async connect() {
    // TODO: Replace with samsung-frame-connect real connection & pairing logic
    this.log.info({ host: this.cfg.host }, 'connect called');
    this.connected = true;
  }

  isConnected() {
    return this.connected;
  }

  async powerOn() {
    this.log.info('powerOn called');
    // TODO: Call library
  }

  async powerOff() {
    this.log.info('powerOff called');
    // TODO: Call library
  }

  async enterArtMode() {
    this.log.info('enterArtMode called');
    // TODO: Call library
  }

  async listArt(): Promise<Array<{ id: string; title?: string }>> {
    this.log.info('listArt called');
    // TODO: Call library
    return [];
  }

  async selectArt(id: string) {
    this.log.info({ id }, 'selectArt called');
    // TODO: Call library
  }

  async setBrightness(value: number) {
    this.log.info({ value }, 'setBrightness called');
    // TODO: Call library
  }

  async setMatte(style: string) {
    this.log.info({ style }, 'setMatte called');
    // TODO: Call library
  }

  async uploadArt(buffer: Buffer, meta?: { title?: string }) {
    this.log.info({ size: buffer.length, meta }, 'uploadArt called');
    // TODO: Call library to upload image and return ID
    return { id: undefined };
  }
}
