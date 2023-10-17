/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as Application from "expo-application";
import { Platform } from "react-native";
import { Subscription } from "expo-modules-core";
import {
  CreateNotificationRequest,
  NotificationItem,
} from "../models/requests/Notification";
import {
  getAllNotifications,
  markNotificationAsRead,
} from "../services/notificationServices";

const RETRY_INTERVAL = 600000;

interface NotificationInterfaceContext {
  notifications: NotificationItem[];
  notificationToken: CreateNotificationRequest | null | undefined;
  setNotifications: (value: React.SetStateAction<NotificationItem[]>) => void;
  onPressNotification: (
    id: number,
    shouldMarkNotificationAsRead: boolean
  ) => void;
  updateNotification: () => void;
  cleanUpNotifications: () => void;
}

export const notiContext =
  React.createContext<NotificationInterfaceContext | null>(null);

export function ProviderNotification({
  children,
}: React.PropsWithChildren<{}>): JSX.Element {
  const auth = useProviderNotification();
  return <notiContext.Provider value={auth}>{children}</notiContext.Provider>;
}

export default function useNotification() {
  return (
    React.useContext(notiContext) ?? {
      notifications: [],
      notificationToken: "",
      setNotifications: () => {},
      onPressNotification: () => {},
      updateNotification: () => {},
      cleanUpNotifications: () => {},
    }
  );
}

export function useProviderNotification(): NotificationInterfaceContext {
  const [notificationToken, setNotificationToken] =
    useState<CreateNotificationRequest | null>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();
  const retry = useRef<NodeJS.Timer>();

  const updateNotification = async () => {
    const allNoties = await getAllNotifications();
    const newNoties = allNoties.filter((notification) => !notification.readAt);
    setNotifications(newNoties);
    try {
      await Notifications.setBadgeCountAsync(newNoties.length);
    } catch (badgeError) {
      console.log("Badge count error", badgeError);
    }
  };

  const cleanUpNotifications = () => {
    setNotifications([]);
    try {
      Notifications.setBadgeCountAsync(0);
    } catch (badgeError) {
      console.log("Badge count error", badgeError);
    }
  };

  const onPressNotification = async (
    id: number,
    shouldMarkNotificationAsRead = true
  ) => {
    if (shouldMarkNotificationAsRead) {
      try {
        await markNotificationAsRead(id);
      } catch (badgeError) {
        console.log("Badge count error", badgeError);
      }
    }
    const allNoties = await getAllNotifications();
    const newNoties = allNoties
      .filter((notification) => notification.readAt === null)
      .filter((notification) => notification.id !== id);
    setNotifications(newNoties);
    try {
      await Notifications.setBadgeCountAsync(
        newNoties.filter((noti) => noti.id !== id).length
      );
    } catch (badgeError) {
      console.log("Badge count error", badgeError);
    }
  };

  const registerFunction = async () => {
    const token = await registerForPushNotificationsAsync();
    setNotificationToken(token);
    notificationListener.current =
      Notifications.addNotificationReceivedListener(async (noti) => {
        const allNoties = await getAllNotifications();
        const newNoties = allNoties.filter(
          (notification) => !notification.readAt
        );
        setNotifications(newNoties);
        try {
          await Notifications.setBadgeCountAsync(newNoties.length);
        } catch (badgeError) {
          console.log("Badge count error", badgeError);
        }
      });
    // add notification interaction listener
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        if (
          response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
        ) {
          const notificationItem = response.notification.request.content
            .data as unknown as NotificationItem;
          if (notificationItem && notificationItem.id) {
            onPressNotification(notificationItem.id, !notificationItem.readAt);
          }
        }
      });
    // if has retry interval set, then clear interval
    if (retry.current) clearInterval(retry.current);
  };

  useEffect(() => {
    registerFunction()?.catch(() => {
      // set retry interval if `registerForPushNotificationsAsync` not successful
      retry.current = setInterval(() => {
        registerFunction();
      }, RETRY_INTERVAL);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    notifications,
    notificationToken,
    setNotifications,
    onPressNotification,
    updateNotification,
    cleanUpNotifications,
  };
}

async function registerForPushNotificationsAsync() {
  let token: string | null = null;
  let deviceId: string | null = null;
  // Check if is a physical device, if not then skip
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    // Check permission status, if not then skip requesting for permission
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    // Check permission status, if not `granted` then skip
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }
    // Get expo push token
    token = (
      await Notifications.getExpoPushTokenAsync({
        experienceId: "@pivotal-technologies/go-ping-pong",
      })
    ).data;

    // Get device id
    deviceId =
      Platform.OS === "ios"
        ? await Application.getIosIdForVendorAsync()
        : Application.androidId;
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("RemarkableSports", {
      name: "RemarkableSports",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  return {
    token: token || "",
    deviceId: deviceId || "",
  } as CreateNotificationRequest;
}
