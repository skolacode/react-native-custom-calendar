import {View} from 'react-native';

import {CustomCalendar} from './src/components';

export default function App() {
  return (
    <View style={{flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'}}>
      <CustomCalendar />
    </View>
  );
}
