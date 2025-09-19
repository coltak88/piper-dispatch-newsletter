/**
 * Appointment Manager Service
 * Comprehensive appointment booking and calendar integration system
 * Handles scheduling, conflicts, reminders, and multi-calendar synchronization
 */

class AppointmentManager {
    constructor(aiAssistant) {
        this.aiAssistant = aiAssistant;
        this.appointments = new Map();
        this.calendars = new Map();
        this.availabilityRules = new Map();
        this.reminderSystem = new ReminderSystem();
        this.conflictResolver = new ConflictResolver();
        this.calendarSync = new CalendarSync();
        this.smartScheduler = new SmartScheduler();
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        await this.loadCalendars();
        await this.setupAvailabilityRules();
        await this.initializeReminderSystem();
        await this.syncExternalCalendars();
        
        this.isInitialized = true;
        console.log('Appointment Manager initialized successfully');
    }

    // Core Appointment Booking
    async bookAppointment(appointmentData) {
        const appointment = {
            id: this.generateAppointmentId(),
            ...appointmentData,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
        };

        // Validate appointment data
        await this.validateAppointment(appointment);

        // Check availability
        const availability = await this.checkAvailability(appointment);
        if (!availability.available) {
            return {
                success: false,
                reason: 'time_not_available',
                conflicts: availability.conflicts,
                alternatives: await this.suggestAlternatives(appointment)
            };
        }

        // Check for conflicts
        const conflicts = await this.detectConflicts(appointment);
        if (conflicts.length > 0) {
            const resolution = await this.resolveConflicts(appointment, conflicts);
            if (!resolution.resolved) {
                return {
                    success: false,
                    reason: 'unresolvable_conflicts',
                    conflicts,
                    suggestions: resolution.suggestions
                };
            }
            appointment.conflictResolution = resolution;
        }

        // Book the appointment
        appointment.status = 'confirmed';
        this.appointments.set(appointment.id, appointment);

        // Add to calendars
        await this.addToCalendars(appointment);

        // Setup reminders
        await this.setupReminders(appointment);

        // Notify participants
        await this.notifyParticipants(appointment, 'booked');

        // Generate confirmation
        const confirmation = await this.generateConfirmation(appointment);

        return {
            success: true,
            appointment,
            confirmation,
            calendarEvents: appointment.calendarEvents
        };
    }

    async validateAppointment(appointment) {
        const errors = [];

        // Required fields validation
        if (!appointment.title) errors.push('Title is required');
        if (!appointment.startTime) errors.push('Start time is required');
        if (!appointment.endTime) errors.push('End time is required');
        if (!appointment.clientId && !appointment.attendees) {
            errors.push('Client or attendees required');
        }

        // Time validation
        const start = new Date(appointment.startTime);
        const end = new Date(appointment.endTime);
        
        if (start >= end) {
            errors.push('End time must be after start time');
        }
        
        if (start < new Date()) {
            errors.push('Cannot book appointments in the past');
        }

        // Duration validation
        const duration = (end - start) / (1000 * 60); // minutes
        if (duration < 15) {
            errors.push('Minimum appointment duration is 15 minutes');
        }
        if (duration > 480) { // 8 hours
            errors.push('Maximum appointment duration is 8 hours');
        }

        // Business hours validation
        const businessHours = await this.getBusinessHours(start);
        if (!this.isWithinBusinessHours(start, end, businessHours)) {
            errors.push('Appointment must be within business hours');
        }

        if (errors.length > 0) {
            throw new Error(`Appointment validation failed: ${errors.join(', ')}`);
        }
    }

    // Smart Scheduling System
    async suggestOptimalTimes(requirements) {
        const {
            duration,
            participantIds = [],
            preferredTimeRanges = [],
            urgency = 'normal',
            type = 'meeting',
            constraints = {}
        } = requirements;

        // Get availability for all participants
        const participantAvailability = await this.getParticipantAvailability(
            participantIds,
            requirements.dateRange
        );

        // Find optimal time slots
        const optimalSlots = await this.smartScheduler.findOptimalSlots({
            duration,
            participantAvailability,
            preferredTimeRanges,
            urgency,
            type,
            constraints
        });

        // Score and rank suggestions
        const rankedSuggestions = await this.rankTimeSuggestions(optimalSlots, requirements);

        return {
            suggestions: rankedSuggestions,
            participantAvailability,
            reasoning: await this.explainSuggestions(rankedSuggestions)
        };
    }

    async rankTimeSuggestions(slots, requirements) {
        const scoredSlots = [];

        for (const slot of slots) {
            const score = await this.calculateSlotScore(slot, requirements);
            scoredSlots.push({ ...slot, score });
        }

        return scoredSlots.sort((a, b) => b.score - a.score);
    }

    async calculateSlotScore(slot, requirements) {
        let score = 100; // Base score

        // Time preference scoring
        if (requirements.preferredTimeRanges) {
            const inPreferredRange = this.isInPreferredRange(slot, requirements.preferredTimeRanges);
            score += inPreferredRange ? 20 : -10;
        }

        // Participant availability scoring
        const availabilityScore = await this.calculateAvailabilityScore(slot, requirements.participantIds);
        score += availabilityScore;

        // Buffer time scoring (prefer slots with buffer time)
        const bufferScore = this.calculateBufferScore(slot);
        score += bufferScore;

        // Travel time consideration
        const travelScore = await this.calculateTravelScore(slot, requirements);
        score += travelScore;

        // Urgency adjustment
        if (requirements.urgency === 'high') {
            score += this.isEarlierSlot(slot) ? 15 : -5;
        }

        return Math.max(0, score);
    }

    // Calendar Integration
    async addToCalendars(appointment) {
        const calendarEvents = [];

        // Add to primary calendar
        const primaryEvent = await this.addToPrimaryCalendar(appointment);
        calendarEvents.push(primaryEvent);

        // Add to participant calendars
        if (appointment.attendees) {
            for (const attendee of appointment.attendees) {
                try {
                    const attendeeEvent = await this.addToAttendeeCalendar(appointment, attendee);
                    calendarEvents.push(attendeeEvent);
                } catch (error) {
                    console.warn(`Failed to add to ${attendee.email}'s calendar:`, error);
                }
            }
        }

        // Sync with external calendars
        await this.syncWithExternalCalendars(appointment);

        appointment.calendarEvents = calendarEvents;
        return calendarEvents;
    }

    async addToPrimaryCalendar(appointment) {
        const event = {
            id: this.generateEventId(),
            appointmentId: appointment.id,
            title: appointment.title,
            description: appointment.description,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            location: appointment.location,
            attendees: appointment.attendees || [],
            reminders: appointment.reminders || [],
            calendar: 'primary'
        };

        // Add to internal calendar
        const calendar = this.calendars.get('primary') || new Map();
        calendar.set(event.id, event);
        this.calendars.set('primary', calendar);

        return event;
    }

    async syncWithExternalCalendars(appointment) {
        const syncResults = [];

        // Google Calendar sync
        if (this.calendarSync.isGoogleCalendarEnabled()) {
            try {
                const googleEvent = await this.calendarSync.addToGoogleCalendar(appointment);
                syncResults.push({ provider: 'google', success: true, eventId: googleEvent.id });
            } catch (error) {
                syncResults.push({ provider: 'google', success: false, error: error.message });
            }
        }

        // Outlook sync
        if (this.calendarSync.isOutlookEnabled()) {
            try {
                const outlookEvent = await this.calendarSync.addToOutlook(appointment);
                syncResults.push({ provider: 'outlook', success: true, eventId: outlookEvent.id });
            } catch (error) {
                syncResults.push({ provider: 'outlook', success: false, error: error.message });
            }
        }

        appointment.externalSync = syncResults;
        return syncResults;
    }

    // Conflict Detection and Resolution
    async detectConflicts(appointment) {
        const conflicts = [];
        const start = new Date(appointment.startTime);
        const end = new Date(appointment.endTime);

        // Check against existing appointments
        for (const [id, existingAppointment] of this.appointments) {
            if (existingAppointment.status === 'cancelled') continue;

            const existingStart = new Date(existingAppointment.startTime);
            const existingEnd = new Date(existingAppointment.endTime);

            if (this.timesOverlap(start, end, existingStart, existingEnd)) {
                conflicts.push({
                    type: 'time_overlap',
                    appointment: existingAppointment,
                    overlapDuration: this.calculateOverlap(start, end, existingStart, existingEnd)
                });
            }
        }

        // Check resource conflicts
        if (appointment.resources) {
            const resourceConflicts = await this.checkResourceConflicts(appointment);
            conflicts.push(...resourceConflicts);
        }

        // Check participant conflicts
        if (appointment.attendees) {
            const participantConflicts = await this.checkParticipantConflicts(appointment);
            conflicts.push(...participantConflicts);
        }

        return conflicts;
    }

    async resolveConflicts(appointment, conflicts) {
        const resolutionStrategies = [];

        for (const conflict of conflicts) {
            switch (conflict.type) {
                case 'time_overlap':
                    resolutionStrategies.push(await this.resolveTimeConflict(appointment, conflict));
                    break;
                case 'resource_conflict':
                    resolutionStrategies.push(await this.resolveResourceConflict(appointment, conflict));
                    break;
                case 'participant_conflict':
                    resolutionStrategies.push(await this.resolveParticipantConflict(appointment, conflict));
                    break;
            }
        }

        // Evaluate resolution strategies
        const bestStrategy = await this.selectBestResolution(resolutionStrategies);
        
        if (bestStrategy && bestStrategy.feasible) {
            await this.applyResolution(appointment, bestStrategy);
            return { resolved: true, strategy: bestStrategy };
        }

        return {
            resolved: false,
            suggestions: resolutionStrategies.filter(s => s.feasible)
        };
    }

    // Reminder System
    async setupReminders(appointment) {
        const defaultReminders = [
            { type: 'email', timing: '24_hours_before' },
            { type: 'sms', timing: '2_hours_before' },
            { type: 'push', timing: '15_minutes_before' }
        ];

        const reminders = appointment.reminders || defaultReminders;
        const scheduledReminders = [];

        for (const reminder of reminders) {
            const scheduledReminder = await this.scheduleReminder(appointment, reminder);
            scheduledReminders.push(scheduledReminder);
        }

        appointment.scheduledReminders = scheduledReminders;
        return scheduledReminders;
    }

    async scheduleReminder(appointment, reminderConfig) {
        const reminderTime = this.calculateReminderTime(appointment.startTime, reminderConfig.timing);
        
        const reminder = {
            id: this.generateReminderId(),
            appointmentId: appointment.id,
            type: reminderConfig.type,
            scheduledTime: reminderTime,
            status: 'scheduled',
            content: await this.generateReminderContent(appointment, reminderConfig)
        };

        await this.reminderSystem.schedule(reminder);
        return reminder;
    }

    calculateReminderTime(appointmentTime, timing) {
        const appointment = new Date(appointmentTime);
        
        switch (timing) {
            case '1_week_before':
                return new Date(appointment.getTime() - (7 * 24 * 60 * 60 * 1000));
            case '24_hours_before':
                return new Date(appointment.getTime() - (24 * 60 * 60 * 1000));
            case '2_hours_before':
                return new Date(appointment.getTime() - (2 * 60 * 60 * 1000));
            case '30_minutes_before':
                return new Date(appointment.getTime() - (30 * 60 * 1000));
            case '15_minutes_before':
                return new Date(appointment.getTime() - (15 * 60 * 1000));
            default:
                return new Date(appointment.getTime() - (60 * 60 * 1000)); // 1 hour default
        }
    }

    // Appointment Management
    async rescheduleAppointment(appointmentId, newTime) {
        const appointment = this.appointments.get(appointmentId);
        if (!appointment) {
            throw new Error('Appointment not found');
        }

        const originalTime = {
            startTime: appointment.startTime,
            endTime: appointment.endTime
        };

        // Update appointment times
        appointment.startTime = newTime.startTime;
        appointment.endTime = newTime.endTime;
        appointment.updatedAt = new Date();
        appointment.version++;

        // Validate new time
        await this.validateAppointment(appointment);

        // Check for new conflicts
        const conflicts = await this.detectConflicts(appointment);
        if (conflicts.length > 0) {
            // Revert changes
            appointment.startTime = originalTime.startTime;
            appointment.endTime = originalTime.endTime;
            
            throw new Error(`Cannot reschedule: conflicts detected with ${conflicts.length} other appointments`);
        }

        // Update calendar events
        await this.updateCalendarEvents(appointment);

        // Update reminders
        await this.updateReminders(appointment);

        // Notify participants
        await this.notifyParticipants(appointment, 'rescheduled', { originalTime });

        return {
            success: true,
            appointment,
            originalTime,
            newTime
        };
    }

    async cancelAppointment(appointmentId, reason = null) {
        const appointment = this.appointments.get(appointmentId);
        if (!appointment) {
            throw new Error('Appointment not found');
        }

        appointment.status = 'cancelled';
        appointment.cancelledAt = new Date();
        appointment.cancellationReason = reason;
        appointment.updatedAt = new Date();

        // Cancel reminders
        await this.cancelReminders(appointment);

        // Remove from calendars
        await this.removeFromCalendars(appointment);

        // Notify participants
        await this.notifyParticipants(appointment, 'cancelled', { reason });

        return {
            success: true,
            appointment,
            cancellationReason: reason
        };
    }

    // Availability Management
    async checkAvailability(timeSlot) {
        const start = new Date(timeSlot.startTime);
        const end = new Date(timeSlot.endTime);
        const conflicts = [];

        // Check business hours
        const businessHours = await this.getBusinessHours(start);
        if (!this.isWithinBusinessHours(start, end, businessHours)) {
            return {
                available: false,
                reason: 'outside_business_hours',
                businessHours
            };
        }

        // Check existing appointments
        for (const [id, appointment] of this.appointments) {
            if (appointment.status === 'cancelled') continue;

            const appointmentStart = new Date(appointment.startTime);
            const appointmentEnd = new Date(appointment.endTime);

            if (this.timesOverlap(start, end, appointmentStart, appointmentEnd)) {
                conflicts.push(appointment);
            }
        }

        // Check blocked times
        const blockedTimes = await this.getBlockedTimes(start, end);
        conflicts.push(...blockedTimes);

        return {
            available: conflicts.length === 0,
            conflicts,
            suggestedAlternatives: conflicts.length > 0 ? await this.suggestAlternatives(timeSlot) : []
        };
    }

    async getAvailableSlots(date, duration = 60) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const businessHours = await this.getBusinessHours(date);
        const slots = [];
        
        let currentTime = new Date(dayStart);
        currentTime.setHours(businessHours.start.hour, businessHours.start.minute);
        
        const endTime = new Date(dayStart);
        endTime.setHours(businessHours.end.hour, businessHours.end.minute);

        while (currentTime < endTime) {
            const slotEnd = new Date(currentTime.getTime() + (duration * 60 * 1000));
            
            if (slotEnd <= endTime) {
                const availability = await this.checkAvailability({
                    startTime: currentTime,
                    endTime: slotEnd
                });
                
                if (availability.available) {
                    slots.push({
                        startTime: new Date(currentTime),
                        endTime: new Date(slotEnd),
                        duration
                    });
                }
            }
            
            currentTime.setMinutes(currentTime.getMinutes() + 15); // 15-minute intervals
        }

        return slots;
    }

    // Utility Methods
    generateAppointmentId() {
        return 'apt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateEventId() {
        return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateReminderId() {
        return 'rem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    timesOverlap(start1, end1, start2, end2) {
        return start1 < end2 && end1 > start2;
    }

    calculateOverlap(start1, end1, start2, end2) {
        const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
        const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
        return Math.max(0, overlapEnd - overlapStart);
    }

    isWithinBusinessHours(start, end, businessHours) {
        const startHour = start.getHours() + (start.getMinutes() / 60);
        const endHour = end.getHours() + (end.getMinutes() / 60);
        
        return startHour >= businessHours.start.hour && 
               endHour <= businessHours.end.hour;
    }

    async getBusinessHours(date) {
        // Default business hours - can be customized
        return {
            start: { hour: 9, minute: 0 },
            end: { hour: 17, minute: 0 }
        };
    }

    async notifyParticipants(appointment, action, metadata = {}) {
        // Implementation for notifying participants
        console.log(`Notifying participants about ${action} for appointment: ${appointment.title}`);
    }
}

// Supporting Classes
class ReminderSystem {
    constructor() {
        this.scheduledReminders = new Map();
        this.reminderQueue = [];
    }

    async schedule(reminder) {
        this.scheduledReminders.set(reminder.id, reminder);
        
        const delay = reminder.scheduledTime - new Date();
        if (delay > 0) {
            setTimeout(() => {
                this.executeReminder(reminder);
            }, delay);
        }
    }

    async executeReminder(reminder) {
        try {
            await this.sendReminder(reminder);
            reminder.status = 'sent';
            reminder.sentAt = new Date();
        } catch (error) {
            reminder.status = 'failed';
            reminder.error = error.message;
        }
    }

    async sendReminder(reminder) {
        switch (reminder.type) {
            case 'email':
                return await this.sendEmailReminder(reminder);
            case 'sms':
                return await this.sendSMSReminder(reminder);
            case 'push':
                return await this.sendPushReminder(reminder);
            default:
                throw new Error(`Unsupported reminder type: ${reminder.type}`);
        }
    }

    async sendEmailReminder(reminder) {
        console.log(`Sending email reminder: ${reminder.content.subject}`);
    }

    async sendSMSReminder(reminder) {
        console.log(`Sending SMS reminder: ${reminder.content.message}`);
    }

    async sendPushReminder(reminder) {
        console.log(`Sending push reminder: ${reminder.content.title}`);
    }
}

class ConflictResolver {
    async resolveTimeConflict(appointment, conflict) {
        return {
            type: 'reschedule',
            feasible: true,
            suggestion: 'Move appointment to next available slot',
            alternatives: await this.findAlternativeSlots(appointment)
        };
    }

    async findAlternativeSlots(appointment) {
        // Find alternative time slots
        return [];
    }
}

class CalendarSync {
    constructor() {
        this.providers = {
            google: { enabled: false, credentials: null },
            outlook: { enabled: false, credentials: null },
            apple: { enabled: false, credentials: null }
        };
    }

    isGoogleCalendarEnabled() {
        return this.providers.google.enabled;
    }

    isOutlookEnabled() {
        return this.providers.outlook.enabled;
    }

    async addToGoogleCalendar(appointment) {
        // Google Calendar API integration
        return { id: 'google_event_' + Date.now() };
    }

    async addToOutlook(appointment) {
        // Outlook API integration
        return { id: 'outlook_event_' + Date.now() };
    }
}

class SmartScheduler {
    async findOptimalSlots(requirements) {
        // AI-powered optimal slot finding
        return [];
    }
}

export default AppointmentManager;