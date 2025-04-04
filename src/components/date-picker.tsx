import { useAtom, atom } from 'jotai';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

import { CalendarDays } from 'lucide-react';

import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';

const firstDay = new Date();
const today = new Date();

firstDay.setDate(1);

export const dateRangeAtom = atom<DateRange | undefined>({
    from: firstDay,
    to: today,
});

export default function DatePicker() {
    const [dateRange, setDateRange] = useAtom(dateRangeAtom);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={'outline'} className="text-sm">
                    <CalendarDays className="w-5 h-5 mr-2 stroke-1" />
                    {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                                {format(dateRange.from, 'LLL dd, y')} -{' '}
                                {format(dateRange.to, 'LLL dd, y')}
                            </>
                        ) : (
                            format(dateRange.from, 'LLL dd, y')
                        )
                    ) : (
                        <span>Pick a date</span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="bg-opacity-100 border-muted"
                />
            </PopoverContent>
        </Popover>
    );
}