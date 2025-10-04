import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export function parseTime(value: string) {
    const first = dayjs(value);

    if (first.isValid()) {
        return first.toDate();
    }

    const second = dayjs(value, 'HH:mm');

    if (second.isValid()) {
        return second.toDate();
    }
}
