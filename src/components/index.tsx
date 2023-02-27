import React, {Fragment, useEffect, useState} from 'react';
import {getCalendar, ICalendar, TDate} from '@skolacode/calendar-js';
import {Animated, Pressable, ScrollView, Text, View} from 'react-native';

import {styles} from '../styles';
import {dayNameInitial, monthName} from '../locale';
import {rand, getCurrentWeekIndex, getLastWeekIndex} from '../utils';
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
  showNav = true,
  expand = true,
  expandHeight = 375,
  expandAnims = [],
  onExpanded = () => {},
  customHeader = ({date, month, year, Header, Prev, Next}: ICustomHeaderProps) => <RenderHeader {...{date, Header, Prev, Next}} />,
  customDay = ({date, day, month, year, styles, show, handlePress}: ICustomDayProps) => <RenderDay {...{date, styles, show, handlePress}} />,
  handlePress = (date: TDate) => {},
}: ICustomCalendarProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(date);
  const [month, setMonth] = useState<number>(currentDate.getMonth());
  const [year, setYear] = useState<number>(currentDate.getFullYear());

  const [expanded, setExpanded] = useState<boolean>(expand);
  const [focusWeek, setFocusWeek] = useState<number>(getCurrentWeekIndex(currentDate));
  const [showOffsetMonth, _setShowOffsetMonth] = useState<boolean>(offsetMonth);
  const [selectedDay, setSelectedDay] = useState<TDate | {}>({});
  const [calendarObj, setCalendarObj] = useState<ICalendar>(getCalendar(month, year));

  const _handleNavigatePrev = () => {
    const lastWeekOfPrevMonth = getLastWeekIndex(calendarObj.previous.month, calendarObj.previous.year);

    if (expanded || focusWeek === 0) {
      const getCalendarObj = getCalendar(calendarObj.previous.month, calendarObj.previous.year);
      CustomCalendarRef[id].getCalendarDate = () => getCalendarObj;
      setCalendarObj(getCalendarObj);

      if (focusWeek === 0) {
        setMonth(calendarObj.previous.month)
        setYear(calendarObj.previous.year);
      }
    }

    const getFocusWeek = focusWeek === 0 ? lastWeekOfPrevMonth : focusWeek - 1;
    CustomCalendarRef[id].focusWeek = getFocusWeek;
    setFocusWeek(getFocusWeek);
  };

  const _handleNavigateNext = () => {
    const lastWeekOfNextMonth = getLastWeekIndex(calendarObj.next.month, calendarObj.next.year);

    if (expanded || focusWeek >= lastWeekOfNextMonth) {
      const getCalendarObj = getCalendar(calendarObj.next.month, calendarObj.next.year);
      CustomCalendarRef[id].getCalendarDate = () => getCalendarObj;
      setCalendarObj(getCalendarObj);

      if (focusWeek >= lastWeekOfNextMonth) {
        setMonth(calendarObj.next.month)
        setYear(calendarObj.next.year);
      }
    }

    const getFocusWeek = focusWeek >= lastWeekOfNextMonth ? 0 : focusWeek + 1;
    CustomCalendarRef[id].focusWeek = getFocusWeek;
    setFocusWeek(getFocusWeek);
  };

  const _handlePressDay = (_date: TDate) => {
    CustomCalendarRef[id].getSelectedDay = () => _date;

    setSelectedDay(_date);
    handlePress(_date);
  };

  let maxWeekRow = 6;
  calendarObj?.calendar?.forEach((week, weekIndex) => {
    week.forEach((d) => {
      if (d.isCurrentMonth) {
        maxWeekRow = weekIndex + 1;
      }
    });
  });

  const [opacityAnimation] = useState(new Animated.Value(0));
  const containerOpacity = opacityAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const [scaleAnimation] = useState(new Animated.Value(0));
  const containerScale = scaleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const anim = {
    grow: {},
  };
  expandAnims.forEach(item => {
    switch (item) {
      case 'grow':
        anim.grow = {transform: [{scale: containerScale}]};
        break;
      default: break;
    }
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, {height: expandHeight, opacity: containerOpacity, ...anim.grow}]}
      ref={(element: any) => {
        CustomCalendarRef[id] = {
          id,
          date: currentDate,
          focusWeek: focusWeek,
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
            const getCalendarObj = getCalendar(parseMonth - 1, parseYear);
            CustomCalendarRef[id].getCalendarDate = () => getCalendarObj;
            setCalendarObj(getCalendarObj);
            setMonth(parseMonth - 1)
            setYear(parseYear);

            const getFocusWeek = 0;
            CustomCalendarRef[id].focusWeek = getFocusWeek;
            setFocusWeek(getFocusWeek);
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
          const isThisWeek: boolean = calendarObj.year === year && calendarObj.month === month && weekNo === focusWeek;
          let toRenderWeek: boolean = weekNo < maxWeekRow;

          if (!expanded) {
            const showFocusedWeek: boolean = calendarObj.month === month ? isThisWeek : weekNo === 0;
            toRenderWeek = toRenderWeek && showFocusedWeek;
          }

          const EachDay = week.map((_date, _index) => {
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
          });

          if (toRenderWeek) {
            return !expanded ? (
              <ScrollView
                key={`weekRow-${weekNo}`}
                scrollEventThrottle={400}
                onMomentumScrollBegin={event => {
                  const direction = event.nativeEvent.contentOffset.y <= 0 ? 'bottom' : 'up';
                  if (direction === 'bottom') {
                    CustomCalendarRef[id].isExpanded = () => true;
                    setExpanded(true);
                    onExpanded();
                  }
                }}>
                <View style={styles.weekRow}>{EachDay}</View>
              </ScrollView>
            ) : (
              <View key={`weekRow-${weekNo}`} style={styles.weekRow}>{EachDay}</View>
            );
          }
        })}
      </View>
    </Animated.View>
  );
};
