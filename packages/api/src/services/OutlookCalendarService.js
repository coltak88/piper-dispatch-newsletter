const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'outlook-calendar-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/outlook-calendar-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/outlook-calendar-combined.log' })
  ]
});

class OutlookCalendarService {
  constructor() {
    this.clientId = process.env.MICROSOFT_CLIENT_ID;
    this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    this.redirectUri = process.env.MICROSOFT_REDIRECT_URI;
    this.tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
    this.baseUrl = 'https://graph.microsoft.com/v1.0';
  }

  getAuthUrl() {
    const scopes = [
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/Calendars.ReadWrite.Shared',
      'https://graph.microsoft.com/User.Read'
    ];

    const authUrl = new URL(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize`);
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('response_mode', 'query');
    authUrl.searchParams.append('state', this.generateState());

    return authUrl.toString();
  }

  async handleCallback(code) {
    try {
      const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
      
      const tokenData = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      });

      const response = await axios.post(tokenUrl, tokenData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const tokens = response.data;
      
      logger.info('Microsoft Outlook OAuth callback successful');
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope
      };
    } catch (error) {
      logger.error('Microsoft Outlook OAuth callback error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Microsoft Outlook');
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
      
      const tokenData = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read'
      });

      const response = await axios.post(tokenUrl, tokenData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const tokens = response.data;
      
      logger.info('Microsoft Outlook access token refreshed');
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type
      };
    } catch (error) {
      logger.error('Microsoft Outlook token refresh error:', error.response?.data || error.message);
      throw new Error('Failed to refresh Microsoft Outlook access token');
    }
  }

  async createEvent(accessToken, eventData) {
    try {
      const event = {
        subject: eventData.title,
        body: {
          contentType: 'HTML',
          content: eventData.description || ''
        },
        start: {
          dateTime: eventData.startTime,
          timeZone: eventData.timezone || 'UTC'
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: eventData.timezone || 'UTC'
        },
        location: eventData.location ? {
          displayName: eventData.location
        } : undefined,
        attendees: eventData.participants?.map(p => ({
          emailAddress: {
            address: p.email,
            name: p.name
          },
          type: 'required'
        })) || [],
        isReminderOn: true,
        reminderMinutesBeforeStart: eventData.reminders?.[0]?.timeBefore ? 
          Math.floor(eventData.reminders[0].timeBefore / 60000) : 15,
        recurrence: eventData.recurrence?.pattern ? this.formatRecurrence(eventData.recurrence) : undefined
      };

      if (eventData.meetingLink) {
        event.isOnlineMeeting = true;
        event.onlineMeetingProvider = 'teamsForBusiness';
      }

      const response = await axios.post(
        `${this.baseUrl}/me/events`,
        event,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'outlook.timezone="UTC"'
          }
        }
      );

      const createdEvent = response.data;
      logger.info(`Microsoft Outlook event created: ${createdEvent.id}`);
      
      return {
        id: createdEvent.id,
        webLink: createdEvent.webLink,
        onlineMeetingUrl: createdEvent.onlineMeeting?.joinUrl,
        meetingId: createdEvent.onlineMeeting?.meetingId,
        created: createdEvent.createdDateTime,
        updated: createdEvent.lastModifiedDateTime
      };
    } catch (error) {
      logger.error('Microsoft Outlook event creation error:', error.response?.data || error.message);
      throw new Error('Failed to create Microsoft Outlook event');
    }
  }

  async updateEvent(accessToken, eventId, eventData) {
    try {
      const event = {
        subject: eventData.title,
        body: {
          contentType: 'HTML',
          content: eventData.description || ''
        },
        start: {
          dateTime: eventData.startTime,
          timeZone: eventData.timezone || 'UTC'
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: eventData.timezone || 'UTC'
        },
        location: eventData.location ? {
          displayName: eventData.location
        } : undefined,
        attendees: eventData.participants?.map(p => ({
          emailAddress: {
            address: p.email,
            name: p.name
          },
          type: 'required'
        })) || []
      };

      const response = await axios.patch(
        `${this.baseUrl}/me/events/${eventId}`,
        event,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'outlook.timezone="UTC"'
          }
        }
      );

      const updatedEvent = response.data;
      logger.info(`Microsoft Outlook event updated: ${eventId}`);
      
      return {
        id: updatedEvent.id,
        webLink: updatedEvent.webLink,
        updated: updatedEvent.lastModifiedDateTime
      };
    } catch (error) {
      logger.error('Microsoft Outlook event update error:', error.response?.data || error.message);
      throw new Error('Failed to update Microsoft Outlook event');
    }
  }

  async deleteEvent(accessToken, eventId) {
    try {
      await axios.delete(
        `${this.baseUrl}/me/events/${eventId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      logger.info(`Microsoft Outlook event deleted: ${eventId}`);
      return { success: true, message: 'Event deleted successfully' };
    } catch (error) {
      logger.error('Microsoft Outlook event deletion error:', error.response?.data || error.message);
      throw new Error('Failed to delete Microsoft Outlook event');
    }
  }

  async getEvents(accessToken, startDateTime, endDateTime, top = 100) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/me/calendarview`,
        {
          params: {
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            $top: top,
            $orderby: 'start/dateTime'
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'outlook.timezone="UTC"'
          }
        }
      );

      const events = response.data.value || [];
      logger.info(`Microsoft Outlook events fetched: ${events.length} events`);
      
      return events.map(event => ({
        id: event.id,
        title: event.subject,
        description: event.body?.content,
        location: event.location?.displayName,
        startTime: event.start.dateTime,
        endTime: event.end.dateTime,
        attendees: event.attendees?.map(a => ({
          email: a.emailAddress.address,
          name: a.emailAddress.name,
          responseStatus: a.status.response
        })) || [],
        meetingLink: event.onlineMeeting?.joinUrl,
        isOnlineMeeting: event.isOnlineMeeting,
        status: event.showAs,
        created: event.createdDateTime,
        updated: event.lastModifiedDateTime
      }));
    } catch (error) {
      logger.error('Microsoft Outlook events fetch error:', error.response?.data || error.message);
      throw new Error('Failed to fetch Microsoft Outlook events');
    }
  }

  async getEvent(accessToken, eventId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/me/events/${eventId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'outlook.timezone="UTC"'
          }
        }
      );

      const event = response.data;
      logger.info(`Microsoft Outlook event fetched: ${eventId}`);
      
      return {
        id: event.id,
        title: event.subject,
        description: event.body?.content,
        location: event.location?.displayName,
        startTime: event.start.dateTime,
        endTime: event.end.dateTime,
        attendees: event.attendees?.map(a => ({
          email: a.emailAddress.address,
          name: a.emailAddress.name,
          responseStatus: a.status.response
        })) || [],
        meetingLink: event.onlineMeeting?.joinUrl,
        isOnlineMeeting: event.isOnlineMeeting,
        status: event.showAs,
        created: event.createdDateTime,
        updated: event.lastModifiedDateTime
      };
    } catch (error) {
      logger.error('Microsoft Outlook event fetch error:', error.response?.data || error.message);
      throw new Error('Failed to fetch Microsoft Outlook event');
    }
  }

  async checkAvailability(accessToken, startDateTime, endDateTime, timezone = 'UTC') {
    try {
      const response = await axios.post(
        `${this.baseUrl}/me/calendar/getSchedule`,
        {
          schedules: ['user@domain.com'],
          startTime: {
            dateTime: startDateTime,
            timeZone: timezone
          },
          endTime: {
            dateTime: endDateTime,
            timeZone: timezone
          },
          availabilityViewInterval: 60
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const schedule = response.data.value?.[0];
      if (!schedule) {
        return [];
      }

      const busyTimes = schedule.availabilityView
        .split('')
        .map((char, index) => ({
          time: new Date(new Date(startDateTime).getTime() + index * 60 * 60 * 1000).toISOString(),
          busy: char !== '0'
        }))
        .filter(slot => slot.busy)
        .reduce((acc, slot, index, arr) => {
          if (index === 0 || !arr[index - 1].busy) {
            acc.push({ start: slot.time, end: null });
          }
          if (index === arr.length - 1 || !arr[index + 1].busy) {
            acc[acc.length - 1].end = new Date(new Date(slot.time).getTime() + 60 * 60 * 1000).toISOString();
          }
          return acc;
        }, []);

      return busyTimes;
    } catch (error) {
      logger.error('Microsoft Outlook availability check error:', error.response?.data || error.message);
      throw new Error('Failed to check Microsoft Outlook availability');
    }
  }

  async createCalendar(accessToken, calendarData) {
    try {
      const calendar = {
        name: calendarData.name,
        color: calendarData.color || 'auto'
      };

      const response = await axios.post(
        `${this.baseUrl}/me/calendars`,
        calendar,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const createdCalendar = response.data;
      logger.info(`Microsoft Outlook calendar created: ${createdCalendar.id}`);
      
      return {
        id: createdCalendar.id,
        name: createdCalendar.name,
        color: createdCalendar.color,
        isDefaultCalendar: createdCalendar.isDefaultCalendar
      };
    } catch (error) {
      logger.error('Microsoft Outlook calendar creation error:', error.response?.data || error.message);
      throw new Error('Failed to create Microsoft Outlook calendar');
    }
  }

  formatRecurrence(recurrence) {
    const pattern = {
      type: recurrence.pattern.toUpperCase(),
      interval: recurrence.interval || 1
    };

    if (recurrence.pattern === 'weekly' && recurrence.daysOfWeek) {
      pattern.daysOfWeek = recurrence.daysOfWeek.map(day => day.toUpperCase());
    }

    if (recurrence.pattern === 'monthly' && recurrence.dayOfMonth) {
      pattern.dayOfMonth = recurrence.dayOfMonth;
    }

    const range = {
      type: recurrence.endDate ? 'endDate' : recurrence.occurrences ? 'numbered' : 'noEnd',
      startDate: new Date().toISOString().split('T')[0]
    };

    if (recurrence.endDate) {
      range.endDate = new Date(recurrence.endDate).toISOString().split('T')[0];
    }

    if (recurrence.occurrences) {
      range.numberOfOccurrences = recurrence.occurrences;
    }

    return {
      pattern: pattern,
      range: range
    };
  }

  generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const user = response.data;
      return {
        id: user.id,
        displayName: user.displayName,
        email: user.mail || user.userPrincipalName,
        givenName: user.givenName,
        surname: user.surname,
        jobTitle: user.jobTitle,
        officeLocation: user.officeLocation
      };
    } catch (error) {
      logger.error('Microsoft Outlook user profile fetch error:', error.response?.data || error.message);
      throw new Error('Failed to fetch Microsoft Outlook user profile');
    }
  }

  async subscribeToChanges(accessToken, webhookUrl, clientState) {
    try {
      const subscription = {
        changeType: 'created,updated,deleted',
        notificationUrl: webhookUrl,
        resource: 'me/events',
        expirationDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        clientState: clientState
      };

      const response = await axios.post(
        `${this.baseUrl}/subscriptions`,
        subscription,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const createdSubscription = response.data;
      logger.info(`Microsoft Outlook subscription created: ${createdSubscription.id}`);
      
      return {
        id: createdSubscription.id,
        expirationDateTime: createdSubscription.expirationDateTime,
        resource: createdSubscription.resource
      };
    } catch (error) {
      logger.error('Microsoft Outlook subscription error:', error.response?.data || error.message);
      throw new Error('Failed to create Microsoft Outlook subscription');
    }
  }

  async renewSubscription(accessToken, subscriptionId, newExpirationDate) {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/subscriptions/${subscriptionId}`,
        {
          expirationDateTime: newExpirationDate
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const renewedSubscription = response.data;
      logger.info(`Microsoft Outlook subscription renewed: ${subscriptionId}`);
      
      return {
        id: renewedSubscription.id,
        expirationDateTime: renewedSubscription.expirationDateTime
      };
    } catch (error) {
      logger.error('Microsoft Outlook subscription renewal error:', error.response?.data || error.message);
      throw new Error('Failed to renew Microsoft Outlook subscription');
    }
  }

  async deleteSubscription(accessToken, subscriptionId) {
    try {
      await axios.delete(
        `${this.baseUrl}/subscriptions/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      logger.info(`Microsoft Outlook subscription deleted: ${subscriptionId}`);
      return { success: true };
    } catch (error) {
      logger.error('Microsoft Outlook subscription deletion error:', error.response?.data || error.message);
      throw new Error('Failed to delete Microsoft Outlook subscription');
    }
  }
}

module.exports = OutlookCalendarService;