const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'google-calendar-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/google-calendar-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/google-calendar-combined.log' })
  ]
});

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async handleCallback(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      logger.info('Google Calendar OAuth callback successful');
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        scope: tokens.scope,
        token_type: tokens.token_type
      };
    } catch (error) {
      logger.error('Google Calendar OAuth callback error:', error);
      throw new Error('Failed to authenticate with Google Calendar');
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      logger.info('Google Calendar access token refreshed');
      return credentials;
    } catch (error) {
      logger.error('Google Calendar token refresh error:', error);
      throw new Error('Failed to refresh Google Calendar access token');
    }
  }

  async createEvent(accessToken, eventData) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const event = {
        summary: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.startTime,
          timeZone: eventData.timezone || 'UTC'
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: eventData.timezone || 'UTC'
        },
        attendees: eventData.participants?.map(p => ({
          email: p.email,
          displayName: p.name,
          responseStatus: 'needsAction'
        })) || [],
        reminders: {
          useDefault: false,
          overrides: eventData.reminders?.map(r => ({
            method: r.type === 'email' ? 'email' : 'popup',
            minutes: Math.floor(r.timeBefore / 60000)
          })) || [
            { method: 'email', minutes: 15 },
            { method: 'popup', minutes: 10 }
          ]
        },
        recurrence: eventData.recurrence?.pattern ? this.formatRecurrence(eventData.recurrence) : undefined
      };

      if (eventData.meetingLink) {
        event.conferenceData = {
          createRequest: {
            requestId: `piper-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        };
      }

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: eventData.meetingLink ? 1 : 0,
        sendUpdates: 'all'
      });

      logger.info(`Google Calendar event created: ${response.data.id}`);
      return {
        id: response.data.id,
        htmlLink: response.data.htmlLink,
        hangoutLink: response.data.hangoutLink,
        meetingCode: response.data.conferenceData?.conferenceId,
        created: response.data.created,
        updated: response.data.updated
      };
    } catch (error) {
      logger.error('Google Calendar event creation error:', error);
      throw new Error('Failed to create Google Calendar event');
    }
  }

  async updateEvent(accessToken, eventId, eventData) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const event = {
        summary: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.startTime,
          timeZone: eventData.timezone || 'UTC'
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: eventData.timezone || 'UTC'
        },
        attendees: eventData.participants?.map(p => ({
          email: p.email,
          displayName: p.name
        })) || []
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
        sendUpdates: 'all'
      });

      logger.info(`Google Calendar event updated: ${eventId}`);
      return {
        id: response.data.id,
        htmlLink: response.data.htmlLink,
        updated: response.data.updated
      };
    } catch (error) {
      logger.error('Google Calendar event update error:', error);
      throw new Error('Failed to update Google Calendar event');
    }
  }

  async deleteEvent(accessToken, eventId) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });

      logger.info(`Google Calendar event deleted: ${eventId}`);
      return { success: true, message: 'Event deleted successfully' };
    } catch (error) {
      logger.error('Google Calendar event deletion error:', error);
      throw new Error('Failed to delete Google Calendar event');
    }
  }

  async getEvents(accessToken, timeMin, timeMax, maxResults = 100) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items.map(event => ({
        id: event.id,
        title: event.summary,
        description: event.description,
        location: event.location,
        startTime: event.start.dateTime || event.start.date,
        endTime: event.end.dateTime || event.end.date,
        attendees: event.attendees?.map(a => ({
          email: a.email,
          name: a.displayName,
          responseStatus: a.responseStatus
        })) || [],
        meetingLink: event.hangoutLink,
        status: event.status,
        created: event.created,
        updated: event.updated
      }));
    } catch (error) {
      logger.error('Google Calendar events fetch error:', error);
      throw new Error('Failed to fetch Google Calendar events');
    }
  }

  async getEvent(accessToken, eventId) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      const event = response.data;
      return {
        id: event.id,
        title: event.summary,
        description: event.description,
        location: event.location,
        startTime: event.start.dateTime || event.start.date,
        endTime: event.end.dateTime || event.end.date,
        attendees: event.attendees?.map(a => ({
          email: a.email,
          name: a.displayName,
          responseStatus: a.responseStatus
        })) || [],
        meetingLink: event.hangoutLink,
        status: event.status,
        created: event.created,
        updated: event.updated
      };
    } catch (error) {
      logger.error('Google Calendar event fetch error:', error);
      throw new Error('Failed to fetch Google Calendar event');
    }
  }

  async checkAvailability(accessToken, timeMin, timeMax, timezone = 'UTC') {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin: timeMin,
          timeMax: timeMax,
          timeZone: timezone,
          items: [{ id: 'primary' }]
        }
      });

      const busyTimes = response.data.calendars.primary.busy || [];
      return busyTimes.map(busy => ({
        start: busy.start,
        end: busy.end
      }));
    } catch (error) {
      logger.error('Google Calendar availability check error:', error);
      throw new Error('Failed to check Google Calendar availability');
    }
  }

  async createCalendar(accessToken, calendarData) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const calendar = {
        summary: calendarData.name,
        description: calendarData.description,
        timeZone: calendarData.timezone || 'UTC'
      };

      const response = await this.calendar.calendars.insert({
        resource: calendar
      });

      logger.info(`Google Calendar created: ${response.data.id}`);
      return {
        id: response.data.id,
        name: response.data.summary,
        description: response.data.description,
        timezone: response.data.timeZone
      };
    } catch (error) {
      logger.error('Google Calendar creation error:', error);
      throw new Error('Failed to create Google Calendar');
    }
  }

  formatRecurrence(recurrence) {
    const rules = [];
    
    if (recurrence.pattern === 'daily') {
      rules.push(`RRULE:FREQ=DAILY;INTERVAL=${recurrence.interval}`);
    } else if (recurrence.pattern === 'weekly') {
      rules.push(`RRULE:FREQ=WEEKLY;INTERVAL=${recurrence.interval}`);
    } else if (recurrence.pattern === 'monthly') {
      rules.push(`RRULE:FREQ=MONTHLY;INTERVAL=${recurrence.interval}`);
    } else if (recurrence.pattern === 'yearly') {
      rules.push(`RRULE:FREQ=YEARLY;INTERVAL=${recurrence.interval}`);
    }

    if (recurrence.endDate) {
      const endDate = new Date(recurrence.endDate);
      const formattedEndDate = endDate.toISOString().split('T')[0].replace(/-/g, '');
      rules[0] += `;UNTIL=${formattedEndDate}`;
    }

    if (recurrence.occurrences) {
      rules[0] += `;COUNT=${recurrence.occurrences}`;
    }

    return rules;
  }

  async watchCalendar(accessToken, channelId, webhookUrl) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const response = await this.calendar.events.watch({
        calendarId: 'primary',
        resource: {
          id: channelId,
          type: 'web_hook',
          address: webhookUrl
        }
      });

      logger.info(`Google Calendar watch established: ${response.data.resourceId}`);
      return {
        resourceId: response.data.resourceId,
        channelId: response.data.id,
        expiration: response.data.expiration
      };
    } catch (error) {
      logger.error('Google Calendar watch error:', error);
      throw new Error('Failed to establish Google Calendar watch');
    }
  }

  async stopChannel(accessToken, channelId, resourceId) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      await this.calendar.channels.stop({
        resource: {
          id: channelId,
          resourceId: resourceId
        }
      });

      logger.info(`Google Calendar watch stopped: ${resourceId}`);
      return { success: true };
    } catch (error) {
      logger.error('Google Calendar stop channel error:', error);
      throw new Error('Failed to stop Google Calendar channel');
    }
  }
}

module.exports = GoogleCalendarService;