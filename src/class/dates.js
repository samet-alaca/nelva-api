export default class Dates {
    static today() {
        const today = new Date();
        return today.toLocaleDateString();
    }

    static dayAgo(n) {
        const today = new Date();
        return new Date(today.setDate(today.getDate() - n)).toLocaleDateString();
    }

    static weekStart() {
        const date = new Date();
        const day = date.getDay();
        date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        return date.toLocaleDateString();
    }

    static monthStart() {
        const date = new Date();
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        return date.toLocaleDateString();
    }

    static yearStart() {
        const date = new Date();
        date.setDate(1);
        date.setMonth(0);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        return date.toLocaleDateString();
    }
}
