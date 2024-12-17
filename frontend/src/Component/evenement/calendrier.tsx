import React, { useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from '../../moment-config';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendrier.css';

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
    id: number;
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
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
    const [popupPosition, setPopupPosition] = React.useState<{ x: number, y: number } | null>(null);

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
        id: event.id_evenement,
    });

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('http://localhost:5000/GET/user-role', {
                    params: {
                        token: token
                    }
                });
                const role = response.data.role;
                if (role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }
    , [token]);

    const handleSelectEvent = (event: Event, e: React.SyntheticEvent) => {
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        setPopupPosition({ x: rect.left, y: rect.top });
        setSelectedEvent(event);
    };

    const handleClosePopup = () => {
        setSelectedEvent(null);
        setPopupPosition(null);
    };

    const handleRegister = () => {
        axios.post('http://localhost:5000/POST/update-participation', {
            token: token,
            id_evenement: selectedEvent?.id,
            presence: true,
        })
        .then((response) => {
            if (response.data.message === 'User already participates in this event') {
                alert('Vous êtes déjà inscrit à cet événement.');
            } else {
                handleClosePopup();
            }
        })
        .catch((error) => {
            if (error.response && error.response.status === 400 && error.response.data.message === 'User already participates in this event') {
                alert('Vous êtes déjà inscrit à cet événement.');
            } else {
                console.error('Error registering for event:', error);
            }
        });
    };

    const EventPopup = ({ event }: { event: Event }) => (
        <div className="popup" style={{ position: 'absolute', left: popupPosition?.x, top: ((popupPosition?.y ?? 0) + 25) }}>
            <div className="popup-content">
            <h2>{event.title}</h2>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Lieu:</strong> {event.location}</p>
            <p><strong>Type:</strong> {event.type}</p>
            <p><strong>Début:</strong> {moment(event.start).format('LLLL')}</p>
            <p><strong>Fin:</strong> {moment(event.end).format('LLLL')}</p>
            <button onClick={handleRegister}>S'inscrire</button>
            <button onClick={handleClosePopup}>Fermer</button>
            </div>
        </div>
    );

    return (
        <>
            {isAdmin && (
                <div>
                    <button onClick={() => setPage(8)}>Ajouter un évènement</button>
                </div>
            )}
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
                    onSelectEvent={handleSelectEvent}
                />
            </div>
            {selectedEvent && popupPosition && <EventPopup event={selectedEvent} />}
        </>
    );
};

export default Calendrier;