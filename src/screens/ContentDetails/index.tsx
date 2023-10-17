import React from "react";
import { Box, IconButton, Toast } from "native-base";
import useSWR from "swr";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { ContentDetailsComponent } from "../../components/ContentDetails";
import ErrorMessage from "../../components/ErrorMessage";
import { formatCoreUrl } from "../../services/ServiceUtil";
import {
  getPostContentById,
  patchPostIncreaseviews,
} from "../../services/ContentServices";
import { useAuth } from "../../hooks/UseAuth";
import PencilIcon from "../../components/Icons/PencilIcon";
import { Role } from "../../models/User";
import { getEventById } from "../../services/EventServices";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";

export type ContentDetailsProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ContentDetails"
>;

const t = getTranslation("screen.ContentDetails");

export default function ContentDetails({
  navigation,
  route,
}: ContentDetailsProps) {
  const { user } = useAuth();

  const { content, contentId, isExpired } = route.params;

  const { data, error, isValidating } = useSWR(
    contentId ? formatCoreUrl(`/post/${contentId}`) : null,
    () => {
      if (contentId) {
        return getPostContentById(contentId);
      }
      return null;
    }
  );

  const contentResult = content || data;
  const isShowEdit =
    !isExpired &&
    (user?.id === contentResult?.creatorId ||
      user?.role.some((r) => r === Role.Admin));

  // add view times
  const { data: viewsData, mutate } = useSWR(
    contentResult
      ? formatCoreUrl(`/post/increaseviews/${contentResult?.id}`)
      : null,
    contentResult ? () => patchPostIncreaseviews(contentResult.id) : null
  );

  // If event is deleted
  const toastShow = () => {
    Toast.show({
      id: "Event_Deleted",
      placement: "top",
      duration: 2000,
      render: () => {
        return (
          <MessageToast
            type={MesssageToastType.Reject}
            title={t("Event Deleted")}
          />
        );
      },
    });
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("Content details"),
        rightComponent: isShowEdit ? (
          <IconButton
            onPress={() => {
              if (contentResult)
                navigation.navigate("UpdateContent", {
                  content: contentResult,
                });
            }}
            icon={<PencilIcon />}
          />
        ) : (
          <Box />
        ),
        containerStyle: { marginHorizontal: 0 },
      }}
      isSticky
    >
      {contentResult && (
        <ContentDetailsComponent
          content={contentResult}
          onPressLink={() => {
            if (contentResult.linkage === "Event" && contentResult.resourceId) {
              getEventById(contentResult.resourceId)
                .then((event) => {
                  if (event) {
                    navigation.navigate("PlayerEventDetails", {
                      eventId: event.id,
                    });
                  } else {
                    toastShow();
                  }
                })
                .catch((e) => {
                  toastShow();
                });
            }
          }}
        />
      )}
      {!isValidating && error && !contentResult && <ErrorMessage />}
    </HeaderLayout>
  );
}
