
import { neon } from '@netlify/neon';
import { CalendarEvent } from '../types';

/**
 * Servizio per la gestione della persistenza su Neon PostgreSQL.
 * Utilizza la variabile d'ambiente NETLIFY_DATABASE_URL iniettata durante la build di Vite.
 */
class DbService {
  private sql: any;
  private isInitialized: boolean = false;

  constructor() {
    try {
      // process.env.NETLIFY_DATABASE_URL viene sostituito dal valore reale da Vite durante la build
      const url = (process.env as any).NETLIFY_DATABASE_URL;
      
      if (url) {
        this.sql = neon(url);
        console.log("Neon DB: Client inizializzato con URL.");
      } else {
        // Fallback per ambienti che supportano l'autodiscovery (es. Netlify Functions)
        this.sql = neon();
        console.warn("Neon DB: URL non trovato in build-time, tentativo autodiscovery.");
      }
    } catch (error) {
      console.warn("Neon DB: Impossibile inizializzare il client. Fallback in modalità locale.");
    }
  }

  /**
   * Crea la tabella se non esiste
   */
  async init() {
    if (!this.sql || this.isInitialized) return;
    try {
      await this.sql`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          category_id TEXT NOT NULL,
          notes TEXT
        )
      `;
      this.isInitialized = true;
      console.log("Neon DB: Tabella verificata/creata con successo.");
    } catch (error) {
      console.error("Neon DB: Errore inizializzazione:", error);
      throw error;
    }
  }

  /**
   * Recupera tutti gli eventi
   */
  async fetchEvents(): Promise<CalendarEvent[]> {
    if (!this.sql) return [];
    try {
      await this.init();
      const rows = await this.sql`SELECT * FROM events ORDER BY start_date ASC`;
      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        startDate: r.start_date,
        endDate: r.end_date,
        categoryId: r.category_id,
        notes: r.notes || ''
      }));
    } catch (error) {
      console.error("Neon DB: Errore fetchEvents:", error);
      return [];
    }
  }

  /**
   * Salva o aggiorna un evento
   */
  async saveEvent(event: CalendarEvent) {
    if (!this.sql) return;
    try {
      await this.init();
      await this.sql`
        INSERT INTO events (id, title, start_date, end_date, category_id, notes)
        VALUES (${event.id}, ${event.title}, ${event.startDate}, ${event.endDate}, ${event.categoryId}, ${event.notes || ''})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          category_id = EXCLUDED.category_id,
          notes = EXCLUDED.notes
      `;
    } catch (error) {
      console.error("Neon DB: Errore saveEvent:", error);
    }
  }

  /**
   * Elimina un evento
   */
  async deleteEvent(id: string) {
    if (!this.sql) return;
    try {
      await this.init();
      await this.sql`DELETE FROM events WHERE id = ${id}`;
    } catch (error) {
      console.error("Neon DB: Errore deleteEvent:", error);
    }
  }
}

export const dbService = new DbService();
