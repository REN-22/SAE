import React, { useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from '../../moment-config';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendrier.css';

const localizer = momentLocalizer(moment);

interface CalendrierProps {
    setPage: any;
    setIdvisionnage : any;
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

const Calendrier: React.FC<CalendrierProps> = ({ setPage, setIdvisionnage }) => {
    const token = localStorage.getItem('phototoken');
    const [events, setEvents] = React.useState<Event[]>([]);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
    const [popupPosition, setPopupPosition] = React.useState<{ x: number, y: number } | null>(null);
    const [isParticipating, setIsParticipating] = React.useState(false);
    

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:5000/GET/events', {
                    params: { token }
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
        start: moment.tz(event.date_heure_debut, "Europe/Paris").toDate(),
        end: moment.tz(event.date_heure_fin, "Europe/Paris").toDate(),
        description: event.descriptif,
        location: event.lieu,
        type: event.type,
        allDay: false,
        id: event.id_evenement,
    });

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('http://localhost:5000/GET/user-role', {
                    params: { token }
                });
                const role = response.data.role;
                setIsAdmin(role === 'admin');
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }, [token]);

    const handleSelectEvent = (event: Event, e: React.SyntheticEvent) => {
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        setPopupPosition({
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
        });
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

    const checkParticipation = async (eventid: number) => {
        console.log('Checking participation for event', eventid);
        try {
            const response = await axios.get('http://localhost:5000/GET/is-participating', {
                params: { id_evenement: eventid, token }
            });
            return response.data.presence;
        } catch (error) {
            console.error('Error checking participation:', error);
            return false;
        }
    };

    const EventComponent = ({ event }: { event: Event }) => {
        useEffect(() => {
            const fetchParticipation = async () => {
                const participating = await checkParticipation(event.id);
                setIsParticipating(participating);
                console.log('Participation:', participating);
            };
            fetchParticipation();
        }, [event.id]);

        const eventClass = isParticipating ? "event-participating" : "event-not-participating";
        return (
            <div className={`rbc-event ${eventClass}`}>
                {event.title}
            </div>
        );
    };

    const EventPopup = ({ event }: { event: Event }) => {
        if (!popupPosition) return null;

        const popupWidth = 300;
        const popupHeight = 200;

        const adjustedX = Math.min(popupPosition.x, window.innerWidth - popupWidth);
        const adjustedY = Math.min(popupPosition.y, window.innerHeight - popupHeight);

        return (
            <div
                className="popup"
                style={{
                    left: adjustedX,
                    top: adjustedY,
                    position: "absolute",
                }}
            >
                <div className="popup-content">
                    <h2>{event.title}</h2>
                    <p><strong>Description:</strong> {event.description}</p>
                    <p><strong>Lieu:</strong> {event.location}</p>
                    <p><strong>Type:</strong> {event.type}</p>
                    <p><strong>Début:</strong> {moment(event.start).format('LLLL')}</p>
                    <p><strong>Fin:</strong> {moment(event.end).format('LLLL')}</p>
                    {moment(event.end).isAfter(moment()) && (
                        <button onClick={handleRegister}>S'inscrire</button>
                    )}
                    <button onClick={() => handleajoutphotovisio(event.id)} >ajouter photo</button>
                    {isAdmin && <button onClick={() => handlevisio(event.id)}>visionnage</button>}
                    <button onClick={handleClosePopup}>Fermer</button>
                </div>
            </div>
        );
    };

    const handleajoutphotovisio = async (idevent: number) => {
        console.log('handleajoutphotovisio');
        await axios.get('http://localhost:5000/GET/visionnage', {
            params: { id_evenement: idevent }
        })
        .then((response) => {
            const idvisionnage = response.data;
            setIdvisionnage(idvisionnage);
            setPage(4);
        })
        .catch((error) => {
            console.error('Error fetching visionnage id:', error);
        });
    }

    const handlevisio = async (idevent: number) => {
        console.log('handlevisio');
        await axios.get('http://localhost:5000/GET/visionnage', {
            params: { id_evenement: idevent }
        })
        .then((response) => {
            const idvisionnage = response.data;
            setIdvisionnage(idvisionnage);
            setPage(10);
        })
        .catch((error) => {
            console.error('Error fetching visionnage id:', error);
        });
    }


    return (
        <>
            {isAdmin && (
                <div>
                    <button onClick={() => setPage(8)}>Ajouter un évènement</button>
                </div>
            )}
            <div className="calendrier">
                <Calendar
                    localizer={localizer}
                    events={events}
                    messages={messages}
                    startAccessor="start"
                    endAccessor="end"
                    allDayAccessor={(event) => event.allDay || false}
                    style={{ height: '100%' }}
                    components={{
                        agenda: {
                            event: EventAgenda,
                        },
                        event: EventComponent,
                    }}
                    onSelectEvent={handleSelectEvent}
                />
            </div>
            {selectedEvent && popupPosition && <EventPopup event={selectedEvent} />}
        </>
    );
};

export default Calendrier;
