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
  expandHeight = 410,
  expandAnims = ['grow'],
  onExpanded = () => {},
  onCollapsed = () => {},
  customHeader = ({date, month, year, Header, Prev, Next}: ICustomHeaderProps) => <RenderHeader {...{date, month, year, Header, Prev, Next}} />,
  customDay = ({date, day, month, year, weekNo, styles, show, handlePress}: ICustomDayProps) => <RenderDay {...{date, day, month, year, styles, weekNo, show, handlePress}} />,
  handlePress = (date: TDate) => {},
}: ICustomCalendarProps) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  
  const [expanded, setExpanded] = useState<boolean>(expand);
  const [showOffsetMonth, _setShowOffsetMonth] = useState<boolean>(offsetMonth);
  const [selectedDay, setSelectedDay] = useState<TDate | {}>({});
  const [focusWeek, setFocusWeek] = useState<number>(getCurrentWeekIndex(date));
  const [calendarObj, setCalendarObj] = useState<ICalendar>(getCalendar(month, year));

  const _handleExpand = () => {
    onExpanded();
    CustomCalendarRef[id].isExpanded = () => true;
    setExpanded(true);
  }

  const _handleCollapse = () => {
    const collapsed = onCollapsed();
    const weekNo = typeof collapsed === 'number' ? collapsed : 0;
    CustomCalendarRef[id].isExpanded = () => false;
    setExpanded(false);

    CustomCalendarRef[id].getFocusWeek = () => weekNo;
    setFocusWeek(weekNo);
  }

  const _handleNavigatePrev = () => {
    const _isExpanded: boolean = CustomCalendarRef[id].isExpanded();
    const _calendarObj: any = CustomCalendarRef[id].getCalendarDate();
    const _focusWeek: number = CustomCalendarRef[id].getFocusWeek();
    const lastWeekOfPrevMonth = getLastWeekIndex(_calendarObj.previous.month, _calendarObj.previous.year);

    if (_isExpanded || _focusWeek === 0) {
      const getCalendarObj = getCalendar(_calendarObj.previous.month, _calendarObj.previous.year);
      CustomCalendarRef[id].getCalendarDate = () => getCalendarObj;
      setCalendarObj(getCalendarObj);
    }

    const getFocusWeek = _focusWeek === 0 ? lastWeekOfPrevMonth : _focusWeek - 1;
    CustomCalendarRef[id].getFocusWeek = () => getFocusWeek;
    setFocusWeek(getFocusWeek);
  };

  const _handleNavigateNext = () => {
    const _isExpanded: boolean = CustomCalendarRef[id].isExpanded();
    const _calendarObj: any = CustomCalendarRef[id].getCalendarDate();
    const _focusWeek: number = CustomCalendarRef[id].getFocusWeek();
    const lastWeekThisMonth = getLastWeekIndex(_calendarObj.month, _calendarObj.year);

    if (_isExpanded || _focusWeek === lastWeekThisMonth) {
      const getCalendarObj = getCalendar(_calendarObj.next.month, _calendarObj.next.year);
      CustomCalendarRef[id].getCalendarDate = () => getCalendarObj;
      setCalendarObj(getCalendarObj);
    }

    const getFocusWeek = _focusWeek === lastWeekThisMonth ? 0 : _focusWeek + 1;
    CustomCalendarRef[id].getFocusWeek = () => getFocusWeek;
    setFocusWeek(getFocusWeek);
  };

  const _handleNavigateMonth = (_month: TMonthNumber, _year: string | number = year, _weekNo: number = 0) => {
    const parseMonth = parseInt(`${_month}`, 10);
    const parseYear = parseInt(`${_year}`, 10);
    const getCalendarObj = getCalendar(parseMonth - 1, parseYear);
    CustomCalendarRef[id].getCalendarDate = () => getCalendarObj;
    setCalendarObj(getCalendarObj);

    CustomCalendarRef[id].getFocusWeek = () => _weekNo;
    setFocusWeek(_weekNo);
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
        anim.grow = {transform: [{scaleY: containerScale}]};
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

  const [scaleInnerAnimation] = useState(new Animated.Value(0));
  const containerScaleInner = scaleInnerAnimation.interpolate({
    inputRange: [28, 32],
    outputRange: [28, 32],
  });
  
  useEffect(() => {
    Animated.timing(scaleInnerAnimation, {
      toValue: !expanded ? 28 : 32,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  return (
    <Animated.View style={[styles.container, {height: expandHeight, opacity: containerOpacity, ...anim.grow}]}
      ref={(element: any) => {
        CustomCalendarRef[id] = {
          id,
          current: element,
          expand: _handleExpand,
          collapse: _handleCollapse,
          isExpanded: () => expanded,
          getFocusWeek: () => focusWeek,
          getCalendarDate: () => calendarObj,
          getSelectedDay: () => selectedDay,
          navigatePrev: _handleNavigatePrev,
          navigateNext: _handleNavigateNext,
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
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={400}
        onMomentumScrollBegin={event => {
          const direction = event.nativeEvent.contentOffset.y <= 0 ? 'bottom' : 'up';
          if (direction === 'bottom') {
            _handleExpand();
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
          let toRenderWeek: boolean = weekNo < maxWeekRow;

          if (!expanded) {
            const showFocusedWeek: boolean = weekNo === focusWeek;
            toRenderWeek = toRenderWeek && showFocusedWeek;
          }

          if (toRenderWeek) {
            return (
              <Animated.View key={`weekRow-${weekNo}`} style={[styles.weekRow, {height: containerScaleInner}]}>
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
              </Animated.View>
            );
          }
        })}
      </ScrollView>
    </Animated.View>
  );
};
