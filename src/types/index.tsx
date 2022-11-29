import {ReactElement} from 'react';
import {TDate} from '@skolacode/calendar-js';
import {ViewComponent, ViewStyle, TextStyle, ImageStyle} from 'react-native';

export type TNamedStyles = ViewStyle | TextStyle | ImageStyle;

export type TMonthName = string[];

export type TMonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

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
    current: ViewComponent | null;
    expand(): void;
    collapse(): void;
    isExpanded(): boolean;
    getSelectedDay(): TDate | null;
    navigatePrev(): void;
    navigateNext(): void;
    navigateMonth(month: TMonthNumber, year?: number): void;
};

export interface ICustomHeaderProps {
    Header(): ReactElement;
    Prev(): ReactElement;
    Next(): ReactElement;
}

export interface ICustomDayProps {
    date: TDate;
    styles: TNamedStyles[];
    show: boolean;
    handlePress(date: TDate): void;
}

export interface ICustomCalendarProps {
    expand?: boolean;
    showNav?: boolean;
    customHeader?(props: ICustomHeaderProps): ReactElement;
    customDay?(props: ICustomDayProps): ReactElement;
    handlePress?(date: TDate): void;
};
