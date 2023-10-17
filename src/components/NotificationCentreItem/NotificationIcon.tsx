import React from "react";
import { Box } from "native-base";
import TipSuccessIcon from "../Icons/TipSuccessIcon";
import TipDialogIcon from "../Icons/TipDialogIcon";
import CloseIcon from "../Icons/CloseIcon";
import ReminderIcon from "../Icons/ReminderIcon";
import RequestIcon from "../Icons/RequestIcon";
import { NotificationType } from "../../models/requests/Notification";

export interface NotificationIconProp {
  type: NotificationType;
}
export default function NotificationIcon({ type }: NotificationIconProp) {
  return (
    <Box
      w="8"
      h="8"
      mt="1"
      alignItems="center"
      justifyContent="center"
      borderRadius="full"
      mr="defaultLayoutSpacing"
      bg="rgba(5,194,140,0.15)"
    >
      {type === NotificationType.Successful && <TipSuccessIcon size="sm" />}
      {type === NotificationType.Reminder && <ReminderIcon size="sm" />}
      {type === NotificationType.Cancellation && <TipDialogIcon size="sm" />}
      {type === NotificationType.Request && <RequestIcon size="sm" />}
      {type === NotificationType.Error && <CloseIcon size="sm" />}
    </Box>
  );
}
