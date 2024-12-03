import React, { useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from '../../moment-config';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface CalendrierProps {
    setPage: any;
}

interface Event {
    title: string;
    start: Date;
    end: Date;
    description: string;
    location: string;
    type: string;
    allDay: boolean;
}


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
    const token = localStorage.getItem('phototoken');
    const [events, setEvents] = React.useState<Event[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:5000/GET/events', {
                    params: {
                        token: token
                    }
                });
                const data = response.data;
                const transformedEvents = data.map(transformEvent);
                setEvents(transformedEvents);
                console.log('Events:', transformedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };  

        fetchEvents();
    }, [token]);
    
    const transformEvent = (event: any): Event => ({
        title: event.titre,
        start: moment.tz(event.date_heure_debut, "Europe/Paris").toDate(), // Conversion explicite
        end: moment.tz(event.date_heure_fin, "Europe/Paris").toDate(),    // Conversion explicite
        description: event.descriptif,
        location: event.lieu,
        type: event.type,
        allDay: false, // Force l'affichage dans les plages horaires
    });

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
                    allDayAccessor={(event) => event.allDay || false} // Force à `false` si pas défini
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