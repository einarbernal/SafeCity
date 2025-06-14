import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function handleRegistrationError(errorMessage: string): null { 
  console.error("Push Notification Registration Error:", errorMessage); 
  return null; 
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C', 
    });
  }

  if (!Device.isDevice) {
    return handleRegistrationError('Must use physical device for push notifications. This is a simulator.');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return handleRegistrationError('Permission not granted to get push token for push notification!');
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId; 

  if (!projectId) {
    return handleRegistrationError('Project ID not found. Ensure it is set in app.json under extra.eas.projectId');
  }

  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log('Expo Push Token:', pushTokenString);
    return pushTokenString;
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return handleRegistrationError(`Failed to get push token: ${errorMessage}`);
  }
}
