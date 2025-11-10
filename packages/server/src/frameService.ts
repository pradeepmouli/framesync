/**
 * Implementation intentionally removed pending /speckit steps.
 * Keeping lightweight types to avoid downstream breakage.
 */

export type FrameConfig = {
  host: string;
  port?: number;
  deviceName?: string;
  deviceId?: string;
};

export class FrameService {
  private connected = false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_cfg: FrameConfig) {}
  async connect() {
    this.connected = false;
  }
  isConnected() {
    return this.connected;
  }
  async powerOn() {}
  async powerOff() {}
  async enterArtMode() {}
  async listArt(): Promise<Array<{ id: string; title?: string }>> {
    return [];
  }
  async selectArt(_id: string) {}
  async setBrightness(_value: number) {}
  async setMatte(_style: string) {}
  async uploadArt(_buffer: Buffer, _meta?: { title?: string }) {
    return { id: undefined as string | undefined };
  }
}
