import React, {Fragment, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {getCalendar, ICalendar, TDate} from '@skolacode/calendar-js';

import {styles} from '../styles';
import {dayNameInitial, monthName} from '../locale';
import {ICustomCalendarProps, ICustomCalendarRef, ICustomHeaderProps, ICustomDayProps, TMonthNumber, TNamedStyles} from '../types';

const CustomCalendarRef: ICustomCalendarRef = {
  current: null,
  expand: () => {},
  collapse: () => {},
  isExpanded: () => false,
  getSelectedDay: () => null,
  navigatePrev: () => {},
  navigateNext: () => {},
  navigateMonth: (month: TMonthNumber, year?: number) => {},
};

const RenderHeader = ({Header, Prev, Next}: ICustomHeaderProps) => {
  return (
    <>
      <Prev />
      <Header />
      <Next />
    </>
  );
};

const RenderDay = ({date, styles, show, handlePress}: ICustomDayProps) => {
  return (
    <Pressable onPress={() => {handlePress(date)}}>
      <Text style={styles}>{show ? date.day : null}</Text>
    </Pressable>
  );
};

const CustomCalendar = ({
  expand = true,
  showNav = true,
  customHeader = ({Header, Prev, Next}: ICustomHeaderProps) => <RenderHeader {...{Header, Prev, Next}} />,
  customDay = ({date, styles, show, handlePress}: ICustomDayProps) => <RenderDay {...{date, styles, show, handlePress}} />,
  handlePress = (date: TDate) => {},
}: ICustomCalendarProps) => {
  const currentDate = new Date();
  /*
    -1 as array index starts from 0
  */
  const WEEK_INDEX_OFFSET = 1;
  const currentWeekIndex = Math.ceil((currentDate.getDate() - currentDate.getDay() - WEEK_INDEX_OFFSET) / 7);
  const day = currentDate.getDate();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const [expanded, setExpanded] = useState<boolean>(expand);
  const [currentMonthOnly, _setCurrentMonthOnly] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<TDate | null>(null);
  const [calendarObj, setCalendarObj] = useState<ICalendar>(getCalendar(month, year));

  const _handleNavigatePrev = () => {
    setCalendarObj(getCalendar(calendarObj.previous.month, calendarObj.previous.year));
    setExpanded(true);
  };

  const _handleNavigateNext = () => {
    setCalendarObj(getCalendar(calendarObj.next.month, calendarObj.next.year));
    setExpanded(true);
  };

  const _handlePressDay = (date: TDate) => {
    setSelectedDay(date);
    handlePress(date);
  };

  return (
    <View style={styles.container} ref={element => {
      CustomCalendarRef.current = element;
      CustomCalendarRef.expand = () => setExpanded(true);
      CustomCalendarRef.collapse = () => setExpanded(false);
      CustomCalendarRef.isExpanded = () => expanded;
      CustomCalendarRef.getSelectedDay = () => selectedDay;
      CustomCalendarRef.navigatePrev = () => _handleNavigatePrev();
      CustomCalendarRef.navigateNext = () => _handleNavigateNext();
      CustomCalendarRef.navigateMonth = (_month, _year = year) => {
        setCalendarObj(getCalendar(_month - 1, _year));
        setExpanded(true);
      };
    }}>
      <View style={styles.headerContainer}>
        {customHeader({
          Header: () => <Text style={styles.headerTitle}>{monthName[calendarObj.month]} {calendarObj.year}</Text>,
          Prev: () => showNav ? (
            <Pressable onPress={_handleNavigatePrev}>
              <Text style={styles.headerPrevBtn}>{'<'}</Text>
            </Pressable>
          ) : <></>,
          Next: () => showNav ? (
            <Pressable onPress={_handleNavigateNext}>
              <Text style={styles.headerNextBtn}>{'>'}</Text>
            </Pressable>
          ) : <></>,
        })}
      </View>

      <View style={[styles.dayContainer]}>
        <View style={styles.weekRow}>
          {Object.values(dayNameInitial).map((day, index) => (
            <Text key={`weekRow-${index}`} style={[styles.dayEach, styles.dayNameEach]}>{day}</Text>
          ))}
        </View>

        {calendarObj.calendar.map((week, weekNo) => {
          const isThisWeek: boolean = calendarObj.year === year && calendarObj.month === month && weekNo === currentWeekIndex;
          let toRenderWeek: boolean = weekNo < 5;
          if (!expanded) {
            const showFocusedWeek: boolean = calendarObj.month === month ? isThisWeek : weekNo === 0;
            toRenderWeek = toRenderWeek && showFocusedWeek;
          }

          return toRenderWeek && (
            <View key={`weekRow-${weekNo}`} style={styles.weekRow}>
              {week.map((date, _index) => {
                const toRenderDay: boolean = currentMonthOnly ? date.isCurrentMonth : true;
                const dayEachStyles: TNamedStyles[] = [styles.dayEach];
                const isToday: boolean = isThisWeek && date.day === day;
                /* Append styling for today */
                if (isToday) {
                  dayEachStyles.push(styles.dayToday);
                }
                const isDaySelected: boolean = toRenderDay && JSON.stringify(date) === JSON.stringify(selectedDay);
                /* Append styling for selected day */
                if (isDaySelected) {
                  dayEachStyles.push(styles.daySelected);
                }
                /* Append styling for offset month */
                if (!date.isCurrentMonth) {
                  dayEachStyles.push(styles.dayOffsetMonth);
                }

                return (
                  <Fragment key={`dayEach-${_index}`}>
                    {customDay({
                      date: date,
                      styles: dayEachStyles,
                      show: toRenderDay,
                      handlePress: _handlePressDay,
                    })}
                  </Fragment>
                )
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export {CustomCalendarRef, CustomCalendar};
