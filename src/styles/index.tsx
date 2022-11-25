import {StyleSheet} from 'react-native';

import {COLORS} from './colors';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerPrevBtn: {
    paddingLeft: 20,
  },
  headerNextBtn: {
    paddingRight: 20,
  },
  headerTitle: {
    paddingLeft: 20,
    paddingRight: 20,
    fontWeight: 'bold',
  },
  dayContainer: {
    marginTop: 20,
    flexDirection: 'column',
  },
  weekRow: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  dayEach: {
    width: 28,
    height: 28,
    padding: 5,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: COLORS.grey20,
  },
  dayNameEach: {
    fontWeight: 'bold',
    color: COLORS.grey10,
  },
  dayToday: {
    borderRadius: 15,
    color: COLORS.white,
    backgroundColor: COLORS.navy,
    overflow: 'hidden',
  },
  daySelected: {
    borderRadius: 15,
    color: COLORS.black,
    backgroundColor: COLORS.dough,
    overflow: 'hidden',
  },
  dayOffsetMonth: {
    color: COLORS.grey,
  },
});
