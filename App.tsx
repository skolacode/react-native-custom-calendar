import React from 'react';
import {StyleSheet, View} from 'react-native';

import {COLORS} from './src/styles/colors';
import {CustomCalendar} from './src/components';

export default function App() {
  return (
    <View style={styles.container}>
      <CustomCalendar id={'customCalendar'} expand={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
});
