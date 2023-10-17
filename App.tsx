/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from "react";
import { DeviceEventEmitter, EmitterSubscription } from "react-native";
import { NativeBaseProvider, VStack } from "native-base";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import * as Font from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import axios from "axios";
import { Provider } from "mobx-react";
import { nativeApplicationVersion } from "expo-application";
import { compare } from "compare-versions";
import Constants from "expo-constants";
import MainStackNavigator from "./src/routers/MainStack";
import store from "./src/stores";
import nativeBaseTheme from "./src/themes/nativeBaseTheme";
import { LAN_CHANGE, setUpAppLanguage } from "./src/language";
import navigationTheme from "./src/themes/navigationTheme";
import { ProvideAuth } from "./src/hooks/UseAuth";
import ApiUrls from "./src/constants/ApiUrls";
import initAxiosInterceptor from "./src/utils/axios";
import { checkandCreatCryptoKey } from "./src/utils/crypto";
import { ProviderNotification } from "./src/hooks/UseNotification";
import NewUpdateAvailable from "./src/screens/NewUpdateAvailable";
import { getAppVersion } from "./src/services/AppVersionServices";
import { showApiToastError } from "./src/components/ApiToastError";

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

// Register background notification task
TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({ data, error, executionInfo }) => {
    console.log("Received a notification in the background!");
    // Do something with the notification data
    console.log("data: ", data);
  }
);
Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

// Register notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface State {
  appReady: boolean;
  appShouldUpdate: boolean;
}

class App extends React.Component<{}, State> {
  listeners: null | undefined | EmitterSubscription;

  constructor(props: {}) {
    super(props);
    this.state = {
      appReady: false,
      appShouldUpdate: false,
    };
  }

  componentDidMount() {
    this.prepareApp();
    this.listeners = DeviceEventEmitter.addListener(LAN_CHANGE, () => {
      this.setState({ appReady: false }, () => {
        this.setState({ appReady: true });
      });
    });
  }

  componentWillUnmount() {
    this.listeners?.remove();
  }

  async loadFonts() {
    await Font.loadAsync({
      "NotoSans-Regular": require("./src/assets/font/NotoSans-Regular.ttf"),
      "NotoSans-Bold": require("./src/assets/font/NotoSans-Bold.ttf"),
    });
  }

  async checkForUpdate() {
    try {
      const versionInfo = await getAppVersion();
      if (nativeApplicationVersion) {
        this.setState({
          appShouldUpdate: compare(
            nativeApplicationVersion,
            versionInfo.versionNumber,
            "<"
          ),
        });
      }
    } catch (checkAppVersionError) {
      showApiToastError(checkAppVersionError);
    }
  }

  async prepareApp() {
    try {
      await this.checkForUpdate();
      // check and craete cryptoKey
      checkandCreatCryptoKey();
      // Set up language
      const language = await setUpAppLanguage();
      await store.setLanguage(language);

      axios.defaults.baseURL = ApiUrls.apiHost;
      axios.defaults.headers.post["Content-Type"] =
        "application/json; charset=utf-8";
      initAxiosInterceptor();

      // Loading fonts
      await this.loadFonts();
    } catch (error) {
      console.error(error);
    } finally {
      this.setState({ appReady: true });
    }
  }

  render() {
    const { appReady, appShouldUpdate } = this.state;
    if (appShouldUpdate) {
      return (
        <NativeBaseProvider
          theme={nativeBaseTheme}
          // Config for maintaining nativebase best practice. Please check https://docs.nativebase.io/strict-mode
          config={{ strictMode: "error" }}
        >
          <NavigationContainer theme={navigationTheme}>
            <NewUpdateAvailable />
          </NavigationContainer>
        </NativeBaseProvider>
      );
    }
    if (appReady) {
      return (
        <ProviderNotification>
          <ProvideAuth>
            <Provider store={store}>
              <NativeBaseProvider
                theme={nativeBaseTheme}
                // Config for maintaining nativebase best practice. Please check https://docs.nativebase.io/strict-mode
                config={{ strictMode: "error" }}
              >
                <NavigationContainer theme={navigationTheme}>
                  <MainStackNavigator />
                </NavigationContainer>
              </NativeBaseProvider>
            </Provider>
          </ProvideAuth>
        </ProviderNotification>
      );
    }

    return null;
  }
}

export default App;
