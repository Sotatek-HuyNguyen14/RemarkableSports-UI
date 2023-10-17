import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { Button, HStack, Pressable, Text, Toast, VStack } from "native-base";
import React from "react";
import { LayoutAnimation } from "react-native";
import useSWR from "swr";
import { showApiToastError } from "../../../components/ApiToastError";
import PermissionCard from "../../../components/Card/PermissionCard";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import ErrorMessage from "../../../components/ErrorMessage";
import GhostTabbar from "../../../components/GhostTabBar";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import Loading from "../../../components/Loading";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { useAuth } from "../../../hooks/UseAuth";
import { ClubStaff, Coach, Player, User } from "../../../models/User";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import {
  GrantOrRevokePostPermission,
  getPostPermission,
} from "../../../services/ContentServices";
import {
  getAllEventPermission,
  postEventPermission,
} from "../../../services/EventServices";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation([
  "screen.AdminScreens.AdminPermission",
  "constant.button",
]);

export default function AdminPermission({
  navigation,
}: NativeStackScreenProps<MainStackNavigatorParamList, "AdminClubApproval">) {
  const { user } = useAuth();
  const {
    data: permissionList,
    isValidating: permissionIsValidating,
    error: permissionError,
    mutate: permissiontMutate,
  } = useSWR(formatCoreUrl("/post-permission"), () =>
    user?.id || user?.sub ? getPostPermission() : null
  );
  const {
    data: eventPermissions,
    isValidating: eventPermissionIsValidating,
    error: eventPermissionError,
    mutate: eventPermissionMutate,
  } = useSWR(formatCoreUrl("/event-permission"), () =>
    user?.id || user?.sub ? getAllEventPermission() : null
  );
  const {
    data: playerData,
    error: playerError,
    mutate: playerMutate,
    isValidating: playerIsValidating,
  } = useSWR<Player[]>(formatCoreUrl("/player"), () =>
    axios.get(formatCoreUrl("/player")).then((res) => res.data)
  );
  const {
    data: coachData,
    error: coachError,
    mutate: coachMutate,
    isValidating: coachIsValidating,
  } = useSWR<Coach[]>(formatCoreUrl("/coach"), () =>
    axios.get(formatCoreUrl("/coach")).then((res) => res.data)
  );
  const {
    data: staffData,
    error: staffError,
    mutate: staffMutate,
    isValidating: staffIsValidating,
  } = useSWR<ClubStaff[]>(formatCoreUrl("/clubstaff"), async () => {
    const res = await axios.get(formatCoreUrl("/clubstaff"));
    return res?.data;
  });

  const availableTabs = [t("Player"), t("Coach"), t("Clubstaff")];
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [isEventOpen, setEventOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>();

  const onPostEventPermission = async (param: {
    userId: string;
    action: "Grant" | "Revoke";
  }) => {
    try {
      const res = await postEventPermission(param);
      if (!Toast.isActive("CRANT_SUCCESSFUL_TOAST")) {
        Toast.show({
          id: "CRANT_SUCCESSFUL_TOAST",
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Successful")}
              />
            );
          },
        });
      }
      onRefreshEvent();
      if (activeTabIndex === 0) onRefreshPlayer();
      if (activeTabIndex === 1) onRefreshCoach();
      if (activeTabIndex === 2) onRefreshStaff();
    } catch (error: any) {
      showApiToastError(error);
    }
  };

  const onApprove = async (id: string) => {
    try {
      const res = await GrantOrRevokePostPermission(id, "Grant");
      if (!Toast.isActive("CRANT_SUCCESSFUL_TOAST")) {
        Toast.show({
          id: "CRANT_SUCCESSFUL_TOAST",
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Successful")}
              />
            );
          },
        });
      }
      onRefreshPermission();
      if (activeTabIndex === 0) onRefreshPlayer();
      if (activeTabIndex === 1) onRefreshCoach();
      if (activeTabIndex === 2) onRefreshStaff();
    } catch (error: any) {
      showApiToastError(error);
    }
  };
  const onReject = async (id: string) => {
    try {
      const res = await GrantOrRevokePostPermission(id, "Revoke");
      if (!Toast.isActive("REVOKE_SUCCESSFUL_TOAST")) {
        Toast.show({
          id: "REVOKE_SUCCESSFUL_TOAST",
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Successful")}
              />
            );
          },
        });
      }
      onRefreshPermission();
      if (activeTabIndex === 0) onRefreshPlayer();
      if (activeTabIndex === 1) onRefreshCoach();
      if (activeTabIndex === 2) onRefreshStaff();
    } catch (error: any) {
      showApiToastError(error);
    }
  };
  const renderFoot = (id: string) => {
    let isGranted = false;
    let isEventGranted = false;
    if (Array.isArray(permissionList) && permissionList.length) {
      isGranted = permissionList.some(
        (item) => item.userId === id && item.canPost === true
      );
    }
    if (Array.isArray(eventPermissions) && eventPermissions.length) {
      isEventGranted = eventPermissions.some(
        (item) => item.userId === id && item.canCreate === true
      );
    }

    return (
      <VStack space={3}>
        <HStack space={3} alignItems="center">
          <Text flex={0.5} fontWeight={600}>
            {t("Content")}:
          </Text>
          <Pressable
            disabled={isGranted}
            _pressed={{ opacity: 0.5 }}
            bg={isGranted ? "rs.button_grey" : "rs.primary_purple"}
            h="10"
            flex={1}
            borderRadius={16}
            alignItems="center"
            justifyContent="center"
            onPress={() => {
              onApprove(id);
            }}
          >
            <Text fontSize="md" textAlign="center" color="rs.white">
              {t("Grant")}
            </Text>
          </Pressable>
          <Pressable
            disabled={!isGranted}
            _pressed={{ opacity: 0.5 }}
            bg={!isGranted ? "rs.button_grey" : "rs.white"}
            h="10"
            flex={1}
            borderWidth={!isGranted ? 0 : 0.5}
            borderColor="rs.primary_purple"
            borderRadius={16}
            alignItems="center"
            justifyContent="center"
            onPress={() => {
              setModalOpen(() => {
                setSelectedId(id);
                return true;
              });
            }}
          >
            <Text
              fontSize="md"
              textAlign="center"
              color={!isGranted ? "rs.white" : "rs.primary_purple"}
            >
              {t("Revoke")}
            </Text>
          </Pressable>
        </HStack>
        <HStack space={3} alignItems="center">
          <Text flex={0.5} fontWeight={600}>
            {t("Event")}:
          </Text>
          <Pressable
            disabled={isEventGranted}
            _pressed={{ opacity: 0.5 }}
            bg={isEventGranted ? "rs.button_grey" : "rs.primary_purple"}
            h="10"
            flex={1}
            borderRadius={16}
            alignItems="center"
            justifyContent="center"
            onPress={async () => {
              await onPostEventPermission({
                userId: id,
                action: "Grant",
              });
            }}
          >
            <Text fontSize="md" textAlign="center" color="rs.white">
              {t("Grant")}
            </Text>
          </Pressable>
          <Pressable
            disabled={!isEventGranted}
            _pressed={{ opacity: 0.5 }}
            bg={!isEventGranted ? "rs.button_grey" : "rs.white"}
            h="10"
            flex={1}
            borderWidth={!isEventGranted ? 0 : 0.5}
            borderColor="rs.primary_purple"
            borderRadius={16}
            alignItems="center"
            justifyContent="center"
            onPress={() => {
              setEventOpen(() => {
                setSelectedId(id);
                return true;
              });
            }}
          >
            <Text
              fontSize="md"
              textAlign="center"
              color={!isEventGranted ? "rs.white" : "rs.primary_purple"}
            >
              {t("Revoke")}
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    );
  };
  const onRefreshPlayer = React.useCallback(() => {
    playerMutate();
  }, [playerMutate]);
  const onRefreshCoach = React.useCallback(() => {
    coachMutate();
  }, [coachMutate]);
  const onRefreshStaff = React.useCallback(() => {
    staffMutate();
  }, [staffMutate]);
  const onRefreshPermission = React.useCallback(() => {
    permissiontMutate();
  }, [permissiontMutate]);
  const onRefreshEvent = React.useCallback(() => {
    eventPermissionMutate();
  }, [eventPermissionMutate]);

  const allRefresh = React.useCallback(() => {
    playerMutate();
    coachMutate();
    staffMutate();
    permissiontMutate();
    eventPermissionMutate();
  }, [
    coachMutate,
    eventPermissionMutate,
    permissiontMutate,
    playerMutate,
    staffMutate,
  ]);
  useFocusEffect(allRefresh);
  return (
    <HeaderLayout
      headerProps={{
        title: t("GoPingPong"),
        hasBackButton: false,
        headerLabelContainerStyle: {
          alignItems: "flex-start",
        },
        rightComponent: (
          <HStack>
            <Button
              size="xs"
              borderRadius={10}
              variant="outline"
              isLoading={
                playerIsValidating || coachIsValidating || staffIsValidating
              }
              onPress={async () => {
                allRefresh();
              }}
            >
              {t("Refresh")}
            </Button>
          </HStack>
        ),
      }}
      isSticky
    >
      <VStack mx="4" space={4} my="4">
        <GhostTabbar
          defaultIndex={activeTabIndex}
          items={availableTabs}
          activateColor="rs.primary_purple"
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setActiveTabIndex(index);
          }}
        />
        {!playerIsValidating &&
          !playerError &&
          Array.isArray(playerData) &&
          activeTabIndex === 0 &&
          playerData.map((val) => (
            <PermissionCard
              key={val.id}
              user={val}
              footer={renderFoot(val?.id)}
            />
          ))}
        {!coachIsValidating &&
          !coachError &&
          Array.isArray(coachData) &&
          activeTabIndex === 1 &&
          coachData.map((val) => (
            <PermissionCard
              key={val.id}
              user={val}
              footer={renderFoot(val?.id)}
            />
          ))}
        {!staffIsValidating &&
          !staffError &&
          Array.isArray(staffData) &&
          activeTabIndex === 2 &&
          staffData.map((val) => (
            <PermissionCard
              key={val.id}
              user={val}
              footer={renderFoot(val?.id)}
            />
          ))}
        {(playerIsValidating ||
          coachIsValidating ||
          staffIsValidating ||
          permissionIsValidating ||
          eventPermissionIsValidating) && <Loading />}
        {((!playerIsValidating && playerError) ||
          (!coachIsValidating && coachError) ||
          (!staffIsValidating && staffError) ||
          (!permissionIsValidating && permissionError) ||
          (!eventPermissionIsValidating && eventPermissionError)) && (
          <ErrorMessage />
        )}
      </VStack>
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Yes")}
        cancelText={t("Cancel")}
        isOpen={isModalOpen}
        onCancel={() => {
          setModalOpen(false);
        }}
        title={t("Are you sure to revoke this permission?")}
        onConfirm={async () => {
          setModalOpen(false);
          if (selectedId) await onReject(selectedId);
        }}
      />
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Yes")}
        cancelText={t("Cancel")}
        isOpen={isEventOpen}
        onCancel={() => {
          setEventOpen(false);
        }}
        title={t("Are you sure to revoke this permission?")}
        onConfirm={async () => {
          setEventOpen(false);
          if (selectedId)
            await onPostEventPermission({
              userId: selectedId,
              action: "Revoke",
            });
        }}
      />
    </HeaderLayout>
  );
}
