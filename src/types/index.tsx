import {ReactElement} from 'react';
import {ViewComponent, ViewStyle, TextStyle, ImageStyle} from 'react-native';
import {ICalendar as ICalendar_, TDate as TDate_} from '@skolacode/calendar-js';

export type TDate = TDate_;

export type TNamedStyles = ViewStyle | TextStyle | ImageStyle;

export type TMonthName = string[];

export type TMonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export interface ICalendar extends ICalendar_ {};

export interface IDayName {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
};

export interface ICustomCalendarRef {
    [key: string]: {
        id: string;
        date: Date | string;
        focusWeek: number;
        current: ViewComponent | null;
        expand(): void;
        collapse(): void;
        isExpanded(): boolean;
        getCalendarDate(): ICalendar | {};
        getSelectedDay(): TDate | {};
        navigatePrev(): void;
        navigateNext(): void;
        navigateMonth(month: TMonthNumber, year?: string | number): void;
    };
};

export interface ICustomHeaderProps {
    date: Date;
    month: string | number;
    year: string | number;
    Header(): ReactElement;
    Prev(): ReactElement;
    Next(): ReactElement;
}

export interface ICustomDayProps {
    date: TDate;
    day: string | number;
    month: string | number;
    year: string | number;
    styles: TNamedStyles[];
    show: boolean;
    handlePress(date: TDate): void;
}

export interface ICustomCalendarProps {
    id?: string;
    date?: Date;
    offsetMonth?: boolean;
    showNav?: boolean;
    expand?: boolean;
    expandHeight?: number;
    expandAnims?: string[];
    onExpanded?(): void;
    customHeader?(props: ICustomHeaderProps): ReactElement;
    customDay?(props: ICustomDayProps): ReactElement;
    handlePress?(date: TDate): void;
};
