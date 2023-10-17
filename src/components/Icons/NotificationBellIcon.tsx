import { useFocusEffect } from "@react-navigation/native";
import { isArray } from "lodash";
import React, { useContext } from "react";
import { View } from "react-native";
import useSWR from "swr";
import useNotification, { notiContext } from "../../hooks/UseNotification";
import { NotificationItem } from "../../models/requests/Notification";
import { getAllNotifications } from "../../services/notificationServices";
import { formatCoreUrl } from "../../services/ServiceUtil";
import BellIcon from "./BellIcon";

function NotificationBellIcon() {
  const context = useContext(notiContext);
  const {
    data: fetchedNotifications,
    error,
    mutate: mutateNotifications,
    isValidating,
  } = useSWR<NotificationItem[]>(
    formatCoreUrl("/notification"),
    getAllNotifications
  );

  useFocusEffect(
    React.useCallback(() => {
      mutateNotifications();
    }, [mutateNotifications])
  );

  const notifications =
    (fetchedNotifications &&
      isArray(fetchedNotifications) &&
      fetchedNotifications.length > 0 &&
      fetchedNotifications?.filter((noti) => !noti.readAt)) ||
    (context?.notifications ? context?.notifications : []);

  return (
    <View>
      <BellIcon />
      {notifications && notifications.length > 0 && (
        <View
          style={{
            width: 5,
            height: 5,
            backgroundColor: "red",
            position: "absolute",
            borderRadius: 20,
          }}
        />
      )}
    </View>
  );
}

export default NotificationBellIcon;
