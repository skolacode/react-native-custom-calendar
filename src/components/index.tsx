import React, {Fragment, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {getCalendar, ICalendar, TDate} from '@skolacode/calendar-js';

import {styles} from '../styles';
import {rand} from '../utils';
import {dayNameInitial, monthName} from '../locale';
import {ICustomCalendarProps, ICustomCalendarRef, ICustomHeaderProps, ICustomDayProps, TMonthNumber, TNamedStyles} from '../types';

export let CustomCalendarRef: ICustomCalendarRef = {};

const RenderHeader = ({Header, Prev, Next}: any) => {
  return (
    <>
      <Prev />
      <Header />
      <Next />
    </>
  );
};

const RenderDay = ({date, styles, show, handlePress}: any) => {
  return (
    <Pressable onPress={() => {handlePress(date)}}>
      <Text style={styles}>{show ? date.day : null}</Text>
    </Pressable>
  );
};

export const CustomCalendar = ({
  id = `${rand(1000000, 9999999)}`,
  date = new Date(),
  offsetMonth = true,
  expand = true,
  showNav = true,
  customHeader = ({date, month, year, Header, Prev, Next}: ICustomHeaderProps) => <RenderHeader {...{date, Header, Prev, Next}} />,
  customDay = ({date, day, month, year, styles, show, handlePress}: ICustomDayProps) => <RenderDay {...{date, styles, show, handlePress}} />,
  handlePress = (date: TDate) => {},
}: ICustomCalendarProps) => {
  const currentDate = date;
  /*
    -1 as array index starts from 0
  */
  const WEEK_INDEX_OFFSET = 1;
  const currentWeekIndex = Math.ceil((currentDate.getDate() - currentDate.getDay() - WEEK_INDEX_OFFSET) / 7);
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const [expanded, setExpanded] = useState<boolean>(expand);
  const [showOffsetMonth, _setShowOffsetMonth] = useState<boolean>(offsetMonth);
  const [selectedDay, setSelectedDay] = useState<TDate | {}>({});
  const [calendarObj, setCalendarObj] = useState<ICalendar>(getCalendar(month, year));

  const _handleNavigatePrev = () => {
    const getCalendarObj = getCalendar(calendarObj.previous.month, calendarObj.previous.year);
    CustomCalendarRef[id].getCalendarDate = () => getCalendarObj;
    CustomCalendarRef[id].isExpanded = () => true;

    setCalendarObj(getCalendarObj);
    setExpanded(true);
  };

  const _handleNavigateNext = () => {
    const getCalendarObj = getCalendar(calendarObj.next.month, calendarObj.next.year);
    CustomCalendarRef[id].getCalendarDate = () => getCalendarObj;
    CustomCalendarRef[id].isExpanded = () => true;

    setCalendarObj(getCalendarObj);
    setExpanded(true);
  };

  const _handlePressDay = (_date: TDate) => {
    CustomCalendarRef[id].getSelectedDay = () => _date;

    setSelectedDay(_date);
    handlePress(_date);
  };

  return (
    <View style={styles.container} ref={element => {
      CustomCalendarRef[id] = {
        id,
        current: element,
        expand: () => setExpanded(true),
        collapse: () => setExpanded(false),
        isExpanded: () => expanded,
        getCalendarDate: () => calendarObj,
        getSelectedDay: () => selectedDay,
        navigatePrev: () => _handleNavigatePrev(),
        navigateNext: () => _handleNavigateNext(),
        navigateMonth: (_month, _year = year) => {
          const parseMonth = parseInt(`${_month}`, 10);
          const parseYear = parseInt(`${_year}`, 10);
          setCalendarObj(getCalendar(parseMonth - 1, parseYear));
          setExpanded(true);
        },
      };
    }}>
      <View style={styles.headerContainer}>
        {customHeader({
          date: date,
          month: monthName[calendarObj.month],
          year: calendarObj.year,
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
          {Object.values(dayNameInitial).map((_day, index) => (
            <Text key={`weekRow-${index}`} style={[styles.dayEach, styles.dayNameEach]}>{_day}</Text>
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
              {week.map((_date, _index) => {
                const toRenderDay: boolean = !showOffsetMonth ? _date.isCurrentMonth : true;
                const dayEachStyles: TNamedStyles[] = [styles.dayEach];

                const today = new Date();
                const isToday: boolean = today.getFullYear() === _date.date.getFullYear() && today.getMonth() === _date.date.getMonth() && today.getDate() === _date.day;

                /* Append styling for today */
                if (isToday) {
                  dayEachStyles.push(styles.dayToday);
                }
                const isDaySelected: boolean = toRenderDay && JSON.stringify(_date) === JSON.stringify(selectedDay);
                /* Append styling for selected day */
                if (isDaySelected) {
                  dayEachStyles.push(styles.daySelected);
                }
                /* Append styling for offset month */
                if (!_date.isCurrentMonth) {
                  dayEachStyles.push(styles.dayOffsetMonth);
                }

                return (
                  <Fragment key={`dayEach-${_index}`}>
                    {customDay({
                      date: _date,
                      day: _date.day,
                      month: monthName[calendarObj.month],
                      year: calendarObj.year,
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
