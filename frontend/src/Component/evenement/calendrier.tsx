import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from '../../moment-config';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface CalendrierProps {
    setPage: any;
}

interface Event {
    title: string;
    start: string;
    end: string;
    description: string;
    location: string;
    type: string;
}

const events: Event[] = [
    {
        title: 'Event 1',
        start: new Date(2023, 10, 1, 10, 0).toISOString(), // November 1, 2023 10:00 AM
        end: new Date(2023, 10, 1, 12, 0).toISOString(), // November 1, 2023 12:00 PM
        description: 'Description for Event 1',
        location: 'Location 1',
        type: 'Type 1',
    },
    {
        title: 'Event 2',
        start: new Date(2023, 10, 2, 14, 0).toISOString(), // November 2, 2023 2:00 PM
        end: new Date(2023, 10, 2, 16, 0).toISOString(), // November 2, 2023 4:00 PM
        description: 'Description for Event 2',
        location: 'Location 2',
        type: 'Type 2',
    },
];

console.log(events);

const messages = {
    allDay: "Toute la journée",
    previous: "Précédent",
    next: "Suivant",
    today: "Aujourd'hui",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    agenda: "Agenda",
    date: "Date",
    time: "Heure",
    event: "Information",
    noEventsInRange: "Aucun événement dans cette période",
};

const EventAgenda = ({ event }: { event: Event }) => (
    <span>
        <em>{event.description}</em>
        <br />
        <span>{event.location}</span>
        <br />
        <span>{event.type}</span>
    </span>
);

const Calendrier: React.FC<CalendrierProps> = ({ setPage }) => {
    return (
        <>
            <div>
                <button onClick={() => setPage(1)}>Retour</button>
                <button onClick={() => setPage(8)}>Ajouter un évènement</button>
            </div>
            <div style={{ height: '100vh' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    messages={messages}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    components={{
                        agenda: {
                            event: EventAgenda,
                        },
                    }}
                />
            </div>
        </>
    );
};

export default Calendrier;