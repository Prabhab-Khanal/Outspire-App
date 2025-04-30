import React, { useContext } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { verifyKhaltiPayment } from '../../services/paymentService'; // Adjust your path
import { AuthContext } from '../../contexts/AuthContext'; // Adjust your path

export default function KhaltiWebViewScreen({ route, navigation }) {
  const { paymentUrl, pidx } = route.params;
  const { userToken } = useContext(AuthContext);

  const handleNavigationChange = async (navState) => {
    const currentUrl = navState.url;
    console.log('Navigating to URL:', currentUrl);

    if (currentUrl.includes('/payment/success')) {
      console.log('Detected Payment Success URL, verifying payment...');
      try {
        const result = await verifyKhaltiPayment(pidx, userToken);

        if (result.status === 'success') {
          Alert.alert('Payment Successful', 'Thank you for purchasing Outspire Premium!', [
            { text: 'OK', onPress: () => navigation.navigate('Premium') },
          ]);
        } else {
          Alert.alert('Payment Verification Failed', 'Please try again.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        Alert.alert('Error', 'Something went wrong during payment verification.');
        navigation.goBack();
      }
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator size="large" color="#28a745" style={styles.loader} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
