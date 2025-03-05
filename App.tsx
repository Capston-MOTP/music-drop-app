/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useRef} from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// 메시지 타입 정의
interface LocationPermissionRequest {
  type: 'PERMISSION_REQUEST';
}

interface LocationPermissionResponse {
  type: 'PERMISSION_RESPONSE';
  granted: boolean;
}

type Message = LocationPermissionRequest;
type ResponseMessage = LocationPermissionResponse;

function App(): React.JSX.Element {
  const webViewRef = useRef<WebView>(null);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // 웹으로 메시지를 보내는 함수
  const sendMessageToWeb = (message: ResponseMessage) => {
    webViewRef.current?.injectJavaScript(`
      document.dispatchEvent(new CustomEvent('${message.type}', {
        detail: ${JSON.stringify(message)},
      }));
    `);
  };

  // 위치 권한 요청
  const requestLocationPermission = async () => {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    const result = await request(permission);
    console.log('result', result);
    const granted = result === RESULTS.GRANTED;
    sendMessageToWeb({
      type: 'PERMISSION_RESPONSE',
      granted,
    });

    if (!granted) {
      Alert.alert('Permission Denied', 'Location permission is required.');
    }
  };

  // 웹에서 메시지를 받았을 때 처리하는 함수
  const handleWebviewMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    const message: Message = JSON.parse(data);

    if (message.type === 'PERMISSION_REQUEST') {
      requestLocationPermission();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={{uri: 'https://grand-horse-f40585.netlify.app/'}}
        javaScriptEnabled={true}
        geolocationEnabled={true}
        onMessage={handleWebviewMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webview: {
    flex: 1,
    width: windowWidth,
    height: windowHeight,
  },
});

export default App;
