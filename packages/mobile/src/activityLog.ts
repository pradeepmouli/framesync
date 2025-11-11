import AsyncStorage from '@react-native-async-storage/async-storage';

export type ActivityType = 'upload' | 'delete' | 'sync';
export type ActivityStatus = 'success' | 'error';

export interface Activity {
  id: string;
  type: ActivityType;
  status: ActivityStatus;
  message: string;
  timestamp: string;
  details?: {
    count?: number;
    assetId?: string;
    albumName?: string;
  };
}

const ACTIVITY_KEY = 'framesync:activity';
const MAX_ACTIVITIES = 50;

export class ActivityLog {
  private activities: Activity[] = [];
  private loaded = false;

  async load(): Promise<Activity[]> {
    if (this.loaded) return this.activities;

    try {
      const stored = await AsyncStorage.getItem(ACTIVITY_KEY);
      if (stored) {
        this.activities = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load activity log:', e);
    }

    this.loaded = true;
    return this.activities;
  }

  async add(
    type: ActivityType,
    status: ActivityStatus,
    message: string,
    details?: Activity['details']
  ): Promise<void> {
    const activity: Activity = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      status,
      message,
      timestamp: new Date().toISOString(),
      details,
    };

    this.activities.unshift(activity);
    
    // Keep only the most recent activities
    if (this.activities.length > MAX_ACTIVITIES) {
      this.activities = this.activities.slice(0, MAX_ACTIVITIES);
    }

    try {
      await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(this.activities));
    } catch (e) {
      console.error('Failed to save activity log:', e);
    }
  }

  async getRecent(limit = 20): Promise<Activity[]> {
    await this.load();
    return this.activities.slice(0, limit);
  }

  async clear(): Promise<void> {
    this.activities = [];
    try {
      await AsyncStorage.removeItem(ACTIVITY_KEY);
    } catch (e) {
      console.error('Failed to clear activity log:', e);
    }
  }
}

export const activityLog = new ActivityLog();
