
import { CalendarEvent } from '../types';
import { generateId } from './id';

// Placeholder Client ID - Sostituisci con il tuo Client ID da Google Cloud Console
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

export class GoogleCalendarService {
  private tokenClient: any = null;
  private accessToken: string | null = null;

  constructor() {
    this.initGIS();
  }

  private initGIS() {
    if (typeof window === 'undefined' || !(window as any).google) return;

    this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error !== undefined) {
          throw response;
        }
        this.accessToken = response.access_token;
      },
    });
  }

  public async authenticate(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.tokenClient) {
          this.initGIS();
        }
        
        this.tokenClient.callback = (response: any) => {
          if (response.error) reject(response.error);
          this.accessToken = response.access_token;
          resolve(response.access_token);
        };

        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (e) {
        reject(e);
      }
    });
  }

  public async fetchEvents(year: number): Promise<CalendarEvent[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const timeMin = new Date(year, 0, 1).toISOString();
    const timeMax = new Date(year, 11, 31, 23, 59, 59).toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Google Calendar events');
    }

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: `google-${item.id}`,
      title: item.summary || 'Google Event',
      startDate: item.start.dateTime || item.start.date,
      endDate: item.end.dateTime || item.end.date,
      categoryId: 'other', // Default category for imported events
      notes: item.description || '',
    }));
  }
}

export const googleCalendarService = new GoogleCalendarService();
