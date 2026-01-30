
import { CalendarEvent } from '../types';
import { generateId } from './id';

// Placeholder Client ID - Sostituisci con il tuo Client ID da Google Cloud Console
// Esempio: 1234567890-abc123def456.apps.googleusercontent.com
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

export class GoogleCalendarService {
  private tokenClient: any = null;
  private accessToken: string | null = null;

  constructor() {
    // Inizializza solo se l'ambiente è pronto e il Client ID è stato impostato
    if (typeof window !== 'undefined') {
      this.initGIS();
    }
  }

  private initGIS() {
    const isDefaultId = CLIENT_ID.startsWith('YOUR_GOOGLE');
    if (isDefaultId) {
      console.warn("Heimdall: Google Calendar Client ID non configurato. La sincronizzazione non sarà disponibile.");
      return;
    }

    // Aspettiamo che lo script di Google sia caricato
    const checkGoogle = () => {
      if ((window as any).google?.accounts?.oauth2) {
        this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.error !== undefined) {
              console.error("GIS Error:", response);
              return;
            }
            this.accessToken = response.access_token;
          },
        });
      } else {
        setTimeout(checkGoogle, 100);
      }
    };
    
    checkGoogle();
  }

  public async authenticate(): Promise<string> {
    if (CLIENT_ID.startsWith('YOUR_GOOGLE')) {
      throw new Error('Google Client ID non configurato. Visita la console Google Cloud per ottenerne uno.');
    }

    return new Promise((resolve, reject) => {
      try {
        if (!this.tokenClient) {
          this.initGIS();
        }
        
        if (!this.tokenClient) {
          return reject(new Error("Impossibile inizializzare il client Google. Verifica la connessione o il Client ID."));
        }

        this.tokenClient.callback = (response: any) => {
          if (response.error) {
            reject(new Error(`Autenticazione fallita: ${response.error}`));
            return;
          }
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
      if (response.status === 401) {
        this.accessToken = null; // Token scaduto, riprova
        return this.fetchEvents(year);
      }
      throw new Error('Errore durante il recupero degli eventi da Google Calendar');
    }

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: `google-${item.id}`,
      title: item.summary || 'Evento Google',
      startDate: item.start.dateTime || item.start.date,
      endDate: item.end.dateTime || item.end.date,
      categoryId: 'other',
      notes: item.description || '',
    }));
  }
}

export const googleCalendarService = new GoogleCalendarService();
