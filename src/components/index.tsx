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
  customDay = ({date, day, month, year, weekNo, styles, show, handlePress}: ICustomDayProps) => <RenderDay {...{date, styles, show, handlePress}} />,
  handlePress = (date: TDate) => {},
}: ICustomCalendarProps) => {
  const [expanded, setExpanded] = useState<boolean>(expand);
  const [showOffsetMonth, _setShowOffsetMonth] = useState<boolean>(offsetMonth);
  const [selectedDay, setSelectedDay] = useState<TDate | {}>({});
  const [focusWeek, setFocusWeek] = useState<number>(getCurrentWeekIndex(date));
  const [calendarObj, setCalendarObj] = useState<ICalendar>(getCalendar(date.getMonth(), date.getFullYear()));
  const [month, setMonth] = useState<number>(calendarObj.month);
  const [year, setYear] = useState<number>(calendarObj.year);

  const _handleExpand = () => {
    CustomCalendarRef[id].isExpanded = () => true;
    setExpanded(true);
  }

  const _handleCollapse = () => {
    CustomCalendarRef[id].isExpanded = () => false;
    setExpanded(false);

    CustomCalendarRef[id].getFocusWeek = () => 0;
    setFocusWeek(0);
  }

  const _handleNavigatePrev = () => {
    const _focusWeek = CustomCalendarRef[id].isExpanded() ? 0 : CustomCalendarRef[id].getFocusWeek();
    const lastWeekOfPrevMonth = getLastWeekIndex(calendarObj.previous.month, calendarObj.previous.year);

    if (CustomCalendarRef[id].isExpanded() || _focusWeek === 0) {
      const getCalendarObj = getCalendar(calendarObj.previous.month, calendarObj.previous.year);
      CustomCalendarRef[id].getCalendarDate = () => getCalendarObj;
      setCalendarObj(getCalendarObj);
      setMonth(getCalendarObj.month);
      setYear(getCalendarObj.year);
    }

    const getFocusWeek = _focusWeek === 0 ? lastWeekOfPrevMonth : _focusWeek - 1;
    CustomCalendarRef[id].getFocusWeek = () => getFocusWeek;
    setFocusWeek(getFocusWeek);
  };

  const _handleNavigateNext = () => {
    const _focusWeek = CustomCalendarRef[id].isExpanded() ? 0 : CustomCalendarRef[id].getFocusWeek();
    const lastWeekOfNextMonth = getLastWeekIndex(calendarObj.next.month, calendarObj.next.year);

    if (CustomCalendarRef[id].isExpanded() || _focusWeek >= lastWeekOfNextMonth) {
      const getCalendarObj = getCalendar(calendarObj.next.month, calendarObj.next.year);
      CustomCalendarRef[id].getCalendarDate = () => getCalendarObj;
      setCalendarObj(getCalendarObj);
      setMonth(getCalendarObj.month);
      setYear(getCalendarObj.year);

    }

    const getFocusWeek = _focusWeek >= lastWeekOfNextMonth ? 0 : _focusWeek + 1;
    CustomCalendarRef[id].getFocusWeek = () => getFocusWeek;
    setFocusWeek(getFocusWeek);
  };

  const _handleNavigateMonth = (_month: TMonthNumber, _year: string | number = year) => {
    const parseMonth = parseInt(`${_month}`, 10);
    const parseYear = parseInt(`${_year}`, 10);
    const getCalendarObj = getCalendar(parseMonth - 1, parseYear);
    CustomCalendarRef[id].getCalendarDate = () => getCalendarObj;
    setCalendarObj(getCalendarObj);
    setMonth(getCalendarObj.month);
    setYear(getCalendarObj.year);

    const getFocusWeek = 0;
    CustomCalendarRef[id].getFocusWeek = () => getFocusWeek;
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
          current: element,
          expand: () => _handleExpand(),
          collapse: () => _handleCollapse(),
          isExpanded: () => expanded,
          getFocusWeek: () => focusWeek,
          getCalendarDate: () => calendarObj,
          getSelectedDay: () => selectedDay,
          navigatePrev: () => _handleNavigatePrev(),
          navigateNext: () => _handleNavigateNext(),
          navigateMonth: _handleNavigateMonth,
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

      <ScrollView
        scrollEventThrottle={400}
        onMomentumScrollBegin={event => {
          const direction = event.nativeEvent.contentOffset.y <= 0 ? 'bottom' : 'up';
          if (direction === 'bottom') {
            _handleExpand();
            onExpanded();
          } else {
            _handleCollapse();
          }
        }}
        style={[styles.dayContainer]}
      >
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

          if (toRenderWeek) {
            return (
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
                        weekNo: _index,
                        styles: dayEachStyles,
                        show: toRenderDay,
                        handlePress: _handlePressDay,
                      })}
                    </Fragment>
                  )
                })}
              </View>
            );
          }
        })}
      </ScrollView>
    </Animated.View>
  );
};
