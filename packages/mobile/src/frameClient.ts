// Samsung Frame TV WebSocket client (initial minimal implementation)
// Protocol summary (simplified):
// - Remote control channel at ws://<ip>:8001 or wss://<ip>:8002
//   path: /api/v2/channels/samsung.remote.control?name=<base64>&token=<token?>
// - First-time connection without a token prompts user approval on TV and returns a token in a connect event.
// - Subsequent connections use the token in the URL.
// - Art Mode transfer uses a separate channel (com.samsung.art-app); TODO later.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

type ConnectResult = 'connected' | 'pairing-required';

class FrameClient {
  private ws: WebSocket | null = null;
  private artWs: WebSocket | null = null;
  private ip: string | null = null;
  private token: string | null = null;
  private connecting: boolean = false;

  private tokenKey(ip: string) { return `framesync:token:${ip}`; }
  private get nameB64() {
    // 'FrameSync' base64 precomputed to avoid platform-specific btoa issues
    return 'RnJhbWVTeW5j';
  }

  private closeSocket() {
    try { this.ws?.close(); } catch { /* noop */ }
    this.ws = null;
  }

  private async loadToken(ip: string) {
    this.token = await AsyncStorage.getItem(this.tokenKey(ip));
    return this.token;
  }

  private async saveToken(ip: string, token: string) {
    this.token = token;
    await AsyncStorage.setItem(this.tokenKey(ip), token);
  }

  private buildUrl(ip: string, secure: boolean, token?: string) {
    const proto = secure ? 'wss' : 'ws';
    const port = secure ? 8002 : 8001;
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
    return `${proto}://${ip}:${port}/api/v2/channels/samsung.remote.control?name=${this.nameB64}${tokenParam}`;
  }

  private buildArtUrl(ip: string, secure: boolean, token?: string) {
    const proto = secure ? 'wss' : 'ws';
    const port = secure ? 8002 : 8001;
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
    return `${proto}://${ip}:${port}/api/v2/channels/com.samsung.art-app?name=${this.nameB64}${tokenParam}`;
  }

  private openWithFallback(ip: string, token?: string): Promise<{ ws: WebSocket; secure: boolean }>{
    // Try secure first (8002); if it fails quickly, fall back to 8001 (plain ws)
    return new Promise((resolve, reject) => {
      let settled = false;
      const errors: any[] = [];

      const tryOpen = (secure: boolean) => {
        const url = this.buildUrl(ip, secure, token);
        let sock: WebSocket | null = null;
        try {
          sock = new WebSocket(url);
        } catch (e) {
          errors.push(e);
          if (!secure) return reject(errors[0]);
          return tryOpen(false);
        }

        const onOpen = () => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve({ ws: sock as WebSocket, secure });
        };
        const onError = (_e: any) => {
          errors.push(_e);
          cleanup();
          if (secure) {
            // try fallback to ws:8001
            tryOpen(false);
          } else if (!settled) {
            reject(errors[0] ?? _e);
          }
        };
        const cleanup = () => {
          sock?.removeEventListener('open', onOpen as any);
          sock?.removeEventListener('error', onError as any);
        };
        sock.addEventListener('open', onOpen as any);
        sock.addEventListener('error', onError as any);
      };

      tryOpen(true);
    });
  }

  private openArtWithFallback(ip: string, token: string): Promise<{ ws: WebSocket; secure: boolean }>{
    return new Promise((resolve, reject) => {
      let settled = false;
      const errors: any[] = [];
      const tryOpen = (secure: boolean) => {
        const url = this.buildArtUrl(ip, secure, token);
        let sock: WebSocket | null = null;
        try { sock = new WebSocket(url); } catch (e) {
          errors.push(e);
          if (!secure) return reject(errors[0]);
          return tryOpen(false);
        }
        const onOpen = () => {
          if (settled) return;
          settled = true; cleanup(); resolve({ ws: sock as WebSocket, secure });
        };
        const onError = (_e: any) => {
          errors.push(_e); cleanup();
          if (secure) tryOpen(false); else if (!settled) reject(errors[0] ?? _e);
        };
        const cleanup = () => {
          sock?.removeEventListener('open', onOpen as any);
          sock?.removeEventListener('error', onError as any);
        };
        sock.addEventListener('open', onOpen as any);
        sock.addEventListener('error', onError as any);
      };
      tryOpen(true);
    });
  }

  async connect(ip: string): Promise<ConnectResult> {
    if (!ip) throw new Error('Missing IP');
    this.ip = ip;
    await this.loadToken(ip);

    this.closeSocket();
    this.connecting = true;
    try {
      const { ws } = await this.openWithFallback(ip, this.token ?? undefined);
      this.ws = ws;

      // If we don't have a token yet, the TV will likely prompt for approval.
      // We'll mark pairing-required immediately and listen for a token.
      if (!this.token) {
        this.attachTokenListener(ip);
        return 'pairing-required';
      }
      // With a token in URL, connection implies we're good.
      this.attachTokenListener(ip); // still attach to catch refreshed token
      return 'connected';
    } finally {
      this.connecting = false;
    }
  }

  private attachTokenListener(ip: string) {
    if (!this.ws) return;
    const onMessage = async (ev: MessageEvent) => {
      try {
        const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        // Heuristic: token may come in a connect event payload
        // { event: 'ms.channel.connect', data: { token: '...' } }
        if (data && typeof data === 'object') {
          const evt = (data.event || data.Event || '').toString();
          const token = data?.data?.token;
          if (evt.includes('connect') && token && typeof token === 'string' && token.length > 0) {
            await this.saveToken(ip, token);
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    };
    this.ws.addEventListener('message', onMessage as any);
  }

  async pair(_pin?: string): Promise<void> {
    if (!this.ip) throw new Error('Not connected');

    // Re-open connection without token to force TV to prompt/emit token if needed.
    // Then wait for token to arrive via onmessage.
    if (this.token) return; // already paired

    // Ensure there's a socket open
    if (!this.ws) {
      const { ws } = await this.openWithFallback(this.ip, undefined);
      this.ws = ws;
      this.attachTokenListener(this.ip);
    }

    const start = Date.now();
    const timeoutMs = 60_000; // 60s to approve on TV
    while (!this.token && Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!this.token) {
      throw new Error('Pairing timed out. Approve the connection on your TV and try again.');
    }
  }

  async sendPhoto(
    assetIdOrUri: string,
    onProgress?: (progress: number) => void
  ): Promise<{ id: string }> {
    if (!this.ip) throw new Error('Connect first');
    if (!this.token) throw new Error('Pair first');
    
    // Resolve to a local file path and read as base64
    let localUri: string | undefined = assetIdOrUri;
    let filename = 'photo.jpg';
    
    if (assetIdOrUri.startsWith('ph://') || assetIdOrUri.length < 64) {
      // assume it's an asset id from MediaLibrary
      const asset = await MediaLibrary.getAssetInfoAsync(assetIdOrUri);
      localUri = asset.localUri ?? undefined;
      filename = asset.filename || `photo_${Date.now()}.jpg`;
    }
    
    if (!localUri) throw new Error('Asset not locally available yet');
    
    onProgress?.(10);
    
    // Read the image file
    const base64 = await FileSystem.readAsStringAsync(localUri, { 
      encoding: 'base64' as any 
    });
    
    if (!base64) throw new Error('Failed to read image');
    
    onProgress?.(30);

    // Open Art Mode channel if not already open
    if (!this.artWs) {
      const { ws } = await this.openArtWithFallback(this.ip, this.token);
      this.artWs = ws;
    }
    
    onProgress?.(50);
    
    // Upload the image using Art Mode channel
    // The Samsung Frame Art Mode API expects a specific protocol
    // This is a simplified implementation that sends the image data
    const uploadId = `upload_${Date.now()}`;
    const msg = JSON.stringify({
      method: 'ms.channel.emit',
      params: {
        event: 'art_upload',
        to: 'host',
        data: {
          id: uploadId,
          filename,
          content: base64,
          mimeType: 'image/jpeg',
        },
      },
    });
    
    try {
      this.artWs?.send(msg);
      onProgress?.(90);
      
      // Wait a bit for the upload to process
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onProgress?.(100);
      
      return { id: uploadId };
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listArt(): Promise<Array<{ id: string; title?: string; sizeBytes?: number }>> {
    if (!this.ip) throw new Error('Connect first');
    if (!this.token) throw new Error('Pair first');

    // Open Art Mode channel if not already open
    if (!this.artWs) {
      const { ws } = await this.openArtWithFallback(this.ip, this.token);
      this.artWs = ws;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('List art timeout'));
      }, 10000);

      const handler = (ev: MessageEvent) => {
        try {
          const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
          if (data?.event === 'art_list') {
            clearTimeout(timeout);
            this.artWs?.removeEventListener('message', handler as any);
            resolve(data?.data?.items || []);
          }
        } catch {
          // ignore parse errors
        }
      };

      this.artWs?.addEventListener('message', handler as any);

      // Request art list
      const msg = JSON.stringify({
        method: 'ms.channel.emit',
        params: { event: 'get_art_list', to: 'host' },
      });
      
      try {
        this.artWs?.send(msg);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async deleteArt(mediaId: string): Promise<boolean> {
    if (!this.ip) throw new Error('Connect first');
    if (!this.token) throw new Error('Pair first');

    // Open Art Mode channel if not already open
    if (!this.artWs) {
      const { ws } = await this.openArtWithFallback(this.ip, this.token);
      this.artWs = ws;
    }

    const msg = JSON.stringify({
      method: 'ms.channel.emit',
      params: {
        event: 'delete_art',
        to: 'host',
        data: { id: mediaId },
      },
    });

    try {
      this.artWs?.send(msg);
      // Wait a bit for the deletion to process
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async setBrightness(_value: number): Promise<void> {
    // TODO: Art Mode control (com.samsung.art-app channel)
  }

  async setMatte(_style: string): Promise<void> {
    // TODO: Art Mode control (com.samsung.art-app channel)
  }
}

export const frameClient = new FrameClient();
