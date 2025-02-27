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
    idvisionnage: any;
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
    participe: boolean;
}

const eventPropGetter = (event: Event) => {
    if (event.participe) {
        return {
            style: {
                backgroundColor: '#FF4000',
            },
        };
    } else {
        return {
            style: {
                backgroundColor: '#ff9000',
            },
        };
    }
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

const Calendrier: React.FC<CalendrierProps> = ({ setPage, setIdvisionnage, idvisionnage }) => {
    const token = localStorage.getItem('phototoken');
    const [events, setEvents] = React.useState<Event[]>([]);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
    const [popupPosition, setPopupPosition] = React.useState<{ x: number, y: number } | null>(null);


    const fetchEvents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/GET/events', {
                params: { token }
            });
            const data = response.data;
            console.log('Data:', data);
            const transformedEvents = data.map(transformEvent);
            setEvents(transformedEvents);
            console.log('Events:', transformedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    useEffect(() => {
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
        participe: event.isParticipating,
    });

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

    useEffect(() => {
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
        fetchEvents();
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
                console.log('Registered for event:', selectedEvent);
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
                    {event.type === 'Visionnage' && (
                        <>
                            {moment(event.end).isAfter(moment()) && event.participe && (
                                <button onClick={() => handleajoutphotovisio(event.id)}>Ajouter photo</button>
                            )}
                            {isAdmin && <button onClick={() => handlevisio(event.id)}>Visionnage</button>}
                        </>
                    )}
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
            const idvisio = response.data;
            setIdvisionnage(idvisio);
            console.log('idvisionnageaaaaaaaaaaaaa :', idvisionnage)
            setPage(4);
        })
        .catch((error) => {
            console.error('Error fetching visionnage id:', error);
        });
    }

    const handlevisio = async (idevent: number) => {
        console.log('handlevisio');
        console.log('idevent :', idevent)
        await axios.get('http://localhost:5000/GET/visionnage', {
            params: { id_evenement: idevent }
        })
        .then((response) => {
            const idvisio = response.data;
            console.log('idvisio :', idvisio)
            setIdvisionnage(idvisio);
            console.log('idvisionnagea :', idvisionnage)
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
                    eventPropGetter={eventPropGetter}
                    onSelectEvent={handleSelectEvent}
                />
            </div>
            {selectedEvent && popupPosition && <EventPopup event={selectedEvent} />}
        </>
    );
};

export default Calendrier;
