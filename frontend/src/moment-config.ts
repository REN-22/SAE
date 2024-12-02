import moment from "moment";
import "moment/locale/fr"; // Importer la localisation française
import "moment-timezone";  // Importer les fonctionnalités de fuseau horaire

// Configurer Moment pour la France
moment.locale("fr"); // Localisation française
moment.tz.setDefault("Europe/Paris"); // Fuseau horaire de Paris

export default moment;
