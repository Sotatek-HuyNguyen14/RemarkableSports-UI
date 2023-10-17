/* eslint-disable no-unsafe-optional-chaining */
import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Avatar,
  Box,
  Divider,
  Heading,
  HStack,
  Pressable,
  Text,
  Toast,
  useTheme,
  View,
  VStack,
} from "native-base";
import { LayoutAnimation } from "react-native";
import useSWR from "swr";
import { uniqueId } from "lodash";
import { useFocusEffect } from "@react-navigation/native";
import { getTranslation } from "../../../utils/translation";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { ClubStaff, UserType } from "../../../models/User";
import { formatCoreUrl, formatFileUrl } from "../../../services/ServiceUtil";
import {
  ApplicationType,
  ClubApplicationResponse,
  ClubPaymentMethodResponse,
  ClubRelationship,
} from "../../../models/responses/Club";
import {
  approvalJoinClub,
  deleteClubPaymentMethod,
  getClubPaymentMethods,
  getCoachAppliedClubs,
  getCoachByClub,
  getPlayerAppliedClubs,
  getPlayerByClub,
  getStaffAppliedClubs,
  getStaffByClub,
  rejectJoinClub,
  removeClubUser,
} from "../../../services/ClubServices";
import GhostTabbar from "../../../components/GhostTabBar";
import { getUserName } from "../../../utils/name";
import { showApiToastError } from "../../../components/ApiToastError";
import { ClubStatusType } from "../../../models/requests/Club";
import { getUserById } from "../../../services/AuthServices";
import { useAuth } from "../../../hooks/UseAuth";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
} from "../../../constants/constants";
import AddIconV2 from "../../../components/Icons/AddIconV2";
import TrashIcon from "../../../components/Icons/TrashIcon";
import PencilIcon from "../../../components/Icons/PencilIcon";
import { showApiToastSuccess } from "../../../components/ApiToastSuccess";
import NoAccessRight from "../../../components/NoAccessRight";
import { isBlank } from "../../../utils/strings";

export type CourseListProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ClubProcess"
>;
const APPROVE_SUCCESSFUL_TOAST = "ApproveSuccessful";
const REJECT_SUCCESSFUL_TOAST = "RejectSuccessful";
const t = getTranslation([
  "screen.ClubScreens.ClubProcess",
  "constant.button",
  "constant.profile",
  "toastMessage",
  "component.Player.PlayerProfile",
]);

export function getPaymentMethodDescription(
  paymentMethod: ClubPaymentMethodResponse
) {
  switch (paymentMethod.paymentType) {
    case "Bank":
      return [
        paymentMethod.bankName,
        paymentMethod.bankAccount,
        paymentMethod.accountName,
      ]
        .filter((method) => method && !isBlank(method))
        .join("\n");
    case "Others":
      return `${paymentMethod.otherPaymentInfo}`;
    case "FPS":
      return [
        paymentMethod.phoneNumber,
        paymentMethod.identifier,
        paymentMethod.accountName,
      ]
        .filter((method) => method && !isBlank(method))
        .join("\n");
    default:
      return [paymentMethod.phoneNumber, paymentMethod.accountName]
        .filter((method) => method && !isBlank(method))
        .join("\n");
  }
}

export default function ClubProcess({ navigation, route }: CourseListProps) {
  const { club } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const availableTabs = [t("Coach"), t("Player"), t("Staff")];
  const manageTabs = [t("Applications"), t("Existing"), t("Payment")];
  const {
    data: coachList,
    error: coachError,
    isValidating: coachIsValidating,
    mutate: coachMutate,
  } = useSWR(formatCoreUrl(`/club/${club?.id}/coach?status=Pending`), () =>
    getCoachAppliedClubs(club?.id)
  );

  const {
    data: playerList,
    error: playerError,
    isValidating: playerIsValidating,
    mutate: playerMutate,
  } = useSWR(formatCoreUrl(`/club/${club?.id}/player?status=Pending`), () =>
    getPlayerAppliedClubs(club?.id)
  );

  const {
    data: staffList,
    error: staffError,
    isValidating: staffIsValidating,
    mutate: staffMutate,
  } = useSWR(formatCoreUrl(`/club/${club?.id}/staff?status=Pending`), () =>
    getStaffAppliedClubs(club?.id)
  );

  const {
    data: coachExisting,
    error: coachExistingError,
    isValidating: coachExistingValidating,
    mutate: coachExistingMutate,
  } = useSWR(formatCoreUrl(`/club/${club?.id}/coach?status=Approved`), () =>
    getCoachByClub(club?.id)
  );
  const {
    data: staffExistingList,
    error: staffExistingError,
    isValidating: staffExistingValidating,
    mutate: staffExistingMutate,
  } = useSWR<ClubApplicationResponse[]>(
    formatCoreUrl(`/club/${club?.id}/staff?status=Approved`),
    () => getStaffByClub(club?.id).then((items) => items)
  );
  const {
    data: playerExistingList,
    error: playerExistingError,
    isValidating: playerExistingValidating,
    mutate: playerExistingMutate,
  } = useSWR<ClubApplicationResponse[]>(
    formatCoreUrl(`/club/${club?.id}/player?status=Approved`),
    () => getPlayerByClub(club?.id).then((items) => items)
  );

  const {
    data: paymentMethods,
    error: paymentMethodsError,
    isValidating: paymentMethodsValidating,
    mutate: paymentMethodsMutate,
  } = useSWR(formatCoreUrl(`/club/${club?.id}/payment-methods`), () =>
    getClubPaymentMethods(club?.id).then((items) => items)
  );

  const [isModalOpen, setModalOpen] = React.useState({
    confirm: false,
    reject: false,
    remove: false,
    removePayment: false,
  });
  const [selectedItem, setSelectedItem] =
    React.useState<ClubApplicationResponse>();
  const [manageTabIndex, setManageTabIndex] = React.useState(0);
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [existingTabIndex, setExistingTabIndex] = React.useState(0);
  const [staffExisting, setStaffExisting] = React.useState(staffExistingList);
  const [selectedRemovePayMethod, setSelectedRemovePayMethod] =
    React.useState<ClubPaymentMethodResponse>();
  const onConfirm = (item: ClubApplicationResponse) => {
    setSelectedItem(item);
    setModalOpen((pre) => ({ ...pre, confirm: true }));
  };
  const onReject = (item: ClubApplicationResponse) => {
    setSelectedItem(item);
    setModalOpen((pre) => ({ ...pre, reject: true }));
  };
  const onRemove = (item: ClubApplicationResponse) => {
    setSelectedItem(item);
    setModalOpen((pre) => ({ ...pre, remove: true }));
  };

  useEffect(() => {
    if (staffExistingList && staffExistingList.length) {
      const localMap = [];
      staffExistingList.forEach((item, index) => {
        getUserById(item.candidateInfo.id)
          .then((staffItem) => {
            localMap.push({
              ...item,
              candidateInfo: { ...item.candidateInfo, ...staffItem },
            });
            setStaffExisting([...localMap]);
          })
          .catch(() => {
            setStaffExisting(staffExistingList);
          });
      });
    } else {
      setStaffExisting(staffExistingList);
    }
  }, [staffExistingList]);

  useFocusEffect(
    React.useCallback(() => {
      staffMutate();
      coachMutate();
      playerMutate();
      coachExistingMutate();
      playerExistingMutate();
      staffExistingMutate();
      paymentMethodsMutate();
    }, [
      staffMutate,
      coachMutate,
      playerMutate,
      coachExistingMutate,
      staffExistingMutate,
      playerExistingMutate,
      paymentMethodsMutate,
    ])
  );

  const onRemoveClubUser = async () => {
    try {
      if (selectedItem) {
        const { clubId, applicationId } = selectedItem;
        await removeClubUser(
          applicationId,
          clubId,
          selectedItem?.candidateInfo.userType === UserType.Coach
            ? "coach"
            : "staff"
        );
        if (!Toast.isActive(APPROVE_SUCCESSFUL_TOAST)) {
          Toast.show({
            id: APPROVE_SUCCESSFUL_TOAST,
            duration: 2000,
            placement: "top",
            render: () => {
              return (
                <MessageToast
                  type={MesssageToastType.Success}
                  title={t("Successful")}
                  body={t("Remove Successful")}
                />
              );
            },
          });
        }
        if (existingTabIndex === 2) {
          staffExistingMutate();
        }
        if (existingTabIndex === 1) {
          playerExistingMutate();
        }
        if (existingTabIndex === 0) {
          coachExistingMutate();
        }
      }
    } catch (error) {
      showApiToastError(error);
    }
  };

  const approveApplication = async () => {
    try {
      if (selectedItem) {
        const type =
          activeTabIndex === 0
            ? ApplicationType.coach
            : activeTabIndex === 1
            ? ApplicationType.player
            : ApplicationType.staff;
        await approvalJoinClub(selectedItem, type);
        if (!Toast.isActive(APPROVE_SUCCESSFUL_TOAST)) {
          Toast.show({
            id: APPROVE_SUCCESSFUL_TOAST,
            duration: 2000,
            placement: "top",
            render: () => {
              return (
                <MessageToast
                  type={MesssageToastType.Success}
                  title={t("Approve")}
                  body={t("Approve Successful")}
                />
              );
            },
          });
        }
        if (activeTabIndex === 2) {
          staffMutate();
          staffExistingMutate();
        }
        if (activeTabIndex === 1) {
          playerMutate();
          playerExistingMutate();
        }
        if (activeTabIndex === 0) {
          coachMutate();
          coachExistingMutate();
        }
      }
    } catch (error: any) {
      console.log("approveApplication_error", error);
      showApiToastError(error);
    }
  };
  const rejectApplication = async () => {
    try {
      if (selectedItem) {
        const type =
          activeTabIndex === 0
            ? ApplicationType.coach
            : activeTabIndex === 1
            ? ApplicationType.player
            : ApplicationType.staff;
        await rejectJoinClub(selectedItem, type);
        if (!Toast.isActive(REJECT_SUCCESSFUL_TOAST)) {
          Toast.show({
            id: REJECT_SUCCESSFUL_TOAST,
            duration: 2000,
            placement: "top",
            render: () => {
              return (
                <MessageToast
                  type={MesssageToastType.Success}
                  title={t("Reject")}
                  body={t("Reject Successful")}
                />
              );
            },
          });
        }
        if (activeTabIndex === 2) staffMutate();
        if (activeTabIndex === 1) playerMutate();
        if (activeTabIndex === 0) coachMutate();
      }
    } catch (error: any) {
      console.log("rejectApplication_error", error);
      showApiToastError(error);
    }
  };

  const removeBox = () => {
    return (
      <Box
        bg="rs.white"
        h="10"
        flex={1}
        borderWidth={0.5}
        borderColor="rs_secondary.error"
        borderRadius={16}
        alignItems="center"
        justifyContent="center"
      >
        <Text
          fontWeight="bold"
          fontSize="sm"
          textAlign="center"
          color="rs_secondary.error"
        >
          {t("Remove")}
        </Text>
      </Box>
    );
  };

  const clubMemberCard = (item: ClubApplicationResponse) => {
    let isMy = false;
    let removeView = null;
    let isClubAdmin = false;
    const { email, firstName, lastName, id, profilePicture, userType } =
      item?.candidateInfo;
    const yearsAsCoach = item?.candidateInfo?.startYearAsCoach
      ? new Date().getFullYear() - item?.candidateInfo?.startYearAsCoach
      : 0;

    const coachExperience = yearsAsCoach.toString();

    const level = item?.candidateInfo?.playerLevel
      ? t(item?.candidateInfo?.playerLevel)
      : "-";
    const rank = item?.candidateInfo?.ranking || t("No Rank");
    const levelRanking = `${level} (${rank})`;

    const localUser = item?.candidateInfo;
    if (userType === UserType.ClubStaff) {
      const staff = localUser as ClubStaff;
      isClubAdmin = staff?.clubRelationship === ClubRelationship.Admin;
      const clubUser = user as ClubStaff;
      isMy = staff?.club?.id === clubUser?.club?.id;
    }

    if (item.approvalStatus === ClubStatusType.Approved) {
      if (item.candidateInfo.userType === UserType.Coach) {
        removeView = removeBox();
      }
      if (
        item.candidateInfo.userType === UserType.ClubStaff &&
        isMy &&
        !isClubAdmin &&
        user?.clubRelationship === ClubRelationship.Admin
      ) {
        removeView = removeBox();
      }
    }
    const shouldRenderManageSalary =
      userType === UserType.Coach && manageTabIndex === 1;
    return (
      <Box
        key={`${item.candidateId}${item.createdAt}`}
        borderRadius="2xl"
        bgColor="rs.white"
        shadow="9"
        style={{
          shadowOffset: {
            width: 5,
            height: 5,
          },
          shadowOpacity: 0.1,
        }}
      >
        <VStack
          py="5"
          px="5"
          borderRadius="2xl"
          overflow="hidden"
          borderWidth="1"
          borderColor="rs.white"
        >
          {isClubAdmin && (
            <View
              zIndex={1}
              style={{
                position: "absolute",
                right: -100,
                width: 300,
                top: 20,
                backgroundColor: "#66CEE1",
                paddingVertical: 10,
                paddingHorizontal: 20,
                justifyContent: "center",
                overflow: "hidden",
                transform: [
                  {
                    rotate: "45deg",
                  },
                ],
              }}
            >
              <Text
                ml="3"
                alignSelf="center"
                flex="1"
                style={{ fontSize: 10 }}
                fontWeight="bold"
              >
                {t("Admin")}
              </Text>
            </View>
          )}
          <HStack space={4}>
            <Avatar
              mt="1"
              size="sm"
              source={
                profilePicture
                  ? {
                      uri: formatFileUrl(profilePicture),
                    }
                  : undefined
              }
            >
              {firstName}
            </Avatar>
            <VStack mr="1" space={2} justifyContent="center" w="70%">
              <Text fontWeight="bold" fontSize={16}>
                {`${getUserName(item.candidateInfo)}`}
              </Text>

              {userType === UserType.Coach && (
                <Text>{`${t("Coached for")} ${coachExperience} ${t(
                  "years"
                )}`}</Text>
              )}
              {userType === UserType.Player && <Text>{levelRanking}</Text>}
              {userType === UserType.ClubStaff && <Text>{email}</Text>}
              <Pressable
                justifyContent="flex-start"
                onPress={async () => {
                  const userInfo = await getUserById(id);
                  if (userInfo) {
                    navigation.navigate("UserProfileViewer", {
                      user: {
                        ...userInfo,
                        userType: userInfo.userType,
                      },
                      shouldShowEditButtonForStaff: false,
                    });
                  }
                }}
              >
                <Text color="#31095E" fontWeight="bold" fontSize={14}>
                  {t("View profile")}
                </Text>
              </Pressable>
            </VStack>
          </HStack>
          {item.approvalStatus === ClubStatusType.Pending &&
            (item.candidateInfo.userType !== UserType.ClubStaff ||
              (item.candidateInfo.userType === UserType.ClubStaff &&
                user.clubRelationship === ClubRelationship.Admin)) && (
              <HStack mt="4" space={3}>
                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => {
                    onConfirm(item);
                  }}
                >
                  <Box
                    bg={APPROVE_BUTTON_COLOR}
                    h="10"
                    flex={1}
                    borderRadius={16}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      textAlign="center"
                      color="rs.white"
                    >
                      {t("Approve")}
                    </Text>
                  </Box>
                </Pressable>
                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => {
                    onReject(item);
                  }}
                >
                  <Box
                    bg="rs.white"
                    h="10"
                    flex={1}
                    borderWidth={0.5}
                    borderColor={REJECT_BUTTON_COLOR}
                    borderRadius={16}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      textAlign="center"
                      color={REJECT_BUTTON_COLOR}
                    >
                      {t("Reject")}
                    </Text>
                  </Box>
                </Pressable>
              </HStack>
            )}

          <HStack mt="4" space={3}>
            {shouldRenderManageSalary && (
              <Pressable
                flex="1"
                bg="rs.primary_purple"
                justifyContent="center"
                alignItems="center"
                px="4"
                py="3"
                borderRadius="2xl"
                onPress={() => {
                  navigation.navigate("ManageCoachSalary", {
                    coachApplication: item,
                  });
                }}
              >
                <Text fontWeight="bold" color="rs.white">
                  {t("Manage Salary")}
                </Text>
              </Pressable>
            )}
            <Pressable
              style={{ flex: 1 }}
              onPress={() => {
                onRemove(item);
              }}
            >
              {removeView}
            </Pressable>
          </HStack>
          {/* )} */}
        </VStack>
      </Box>
    );
  };

  const existingView = () => {
    let localStaffs = staffExisting;
    const adminList = staffExisting?.filter((val) => {
      const localVal = {
        ...val,
        candidateInfo: val.candidateInfo as ClubStaff,
      };

      return localVal.candidateInfo.clubRelationship === ClubRelationship.Admin;
    });

    const otherStaffs = staffExisting?.filter((val) => {
      const localVal = {
        ...val,
        candidateInfo: val.candidateInfo as ClubStaff,
      };

      return localVal.candidateInfo.clubRelationship !== ClubRelationship.Admin;
    });
    if (adminList && otherStaffs) {
      localStaffs = [...adminList, ...otherStaffs];
    }
    return (
      <VStack space={4}>
        <GhostTabbar
          defaultIndex={existingTabIndex}
          items={availableTabs.map((val, index) => {
            if (index === 0) {
              return `${val} (${coachExisting?.length ?? 0})`;
            }
            if (index === 1) {
              return `${val} (${playerExistingList?.length ?? 0})`;
            }
            if (index === 2) {
              return `${val} (${staffExisting?.length ?? 0})`;
            }
          })}
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setExistingTabIndex(index);
          }}
        />

        {existingTabIndex === 0 && (
          <VStack space={6}>
            {coachExistingValidating && <Loading />}
            {!coachExistingValidating && coachExistingError && <ErrorMessage />}
            {coachExisting &&
              coachExisting.length > 0 &&
              coachExisting.map((item) => {
                return clubMemberCard(item);
              })}
          </VStack>
        )}
        {existingTabIndex === 1 && (
          <VStack space={6}>
            {playerExistingValidating && <Loading />}
            {!playerExistingValidating && playerExistingError && (
              <ErrorMessage />
            )}
            {playerExistingList &&
              playerExistingList.length > 0 &&
              playerExistingList.map((item) => {
                return clubMemberCard(item);
              })}
          </VStack>
        )}
        {existingTabIndex === 2 && (
          <VStack space={6}>
            {staffExistingValidating && <Loading />}
            {!staffExistingValidating && staffExistingError && <ErrorMessage />}
            {!staffExistingValidating &&
              !staffExistingError &&
              localStaffs &&
              localStaffs.length > 0 &&
              localStaffs.map((val) => {
                return clubMemberCard(val);
              })}
          </VStack>
        )}
      </VStack>
    );
  };

  const applicationsView = () => {
    return (
      <VStack space={6}>
        <GhostTabbar
          defaultIndex={activeTabIndex}
          items={availableTabs.map((val, index) => {
            if (index === 0) {
              return `${val} (${coachList?.length ?? 0})`;
            }
            if (index === 1) {
              return `${val} (${playerList?.length ?? 0})`;
            }
            if (index === 2) {
              return `${val} (${staffList?.length ?? 0})`;
            }
          })}
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setActiveTabIndex(index);
          }}
        />

        {activeTabIndex === 0 && (
          <VStack space={6}>
            {coachIsValidating && <Loading />}
            {!coachIsValidating && coachError && <ErrorMessage />}
            {coachList &&
              coachList.length > 0 &&
              coachList.map((item) => {
                return clubMemberCard(item);
              })}
          </VStack>
        )}

        {activeTabIndex === 1 && (
          <VStack space={4}>
            {playerIsValidating && <Loading />}
            {!playerIsValidating && playerError && <ErrorMessage />}
            {playerList &&
              playerList.length > 0 &&
              playerList.map((item) => {
                return clubMemberCard(item);
              })}
          </VStack>
        )}

        {activeTabIndex === 2 && (
          <VStack space={4}>
            {staffIsValidating && <Loading />}
            {!staffIsValidating && staffError && <ErrorMessage />}
            {staffList &&
              staffList.length > 0 &&
              staffList.map((item) => {
                return clubMemberCard(item);
              })}
          </VStack>
        )}
      </VStack>
    );
  };

  const paymentMethodItem = (paymentMethod: ClubPaymentMethodResponse) => {
    return (
      <HStack
        key={uniqueId()}
        p="defaultLayoutSpacing"
        borderBottomColor="rs.lightGrey"
        borderBottomWidth="1px"
        justifyContent="space-between"
      >
        <VStack mr="1">
          <Heading>{paymentMethod.paymentType}</Heading>
          {paymentMethod.paymentType === "Bank" && (
            <VStack>
              <Text>
                {t("Bank Name")}: {paymentMethod.bankName}
              </Text>
              <Text>
                {t("Account Number")}: {paymentMethod.bankAccount}
              </Text>
              <Text>
                {t("Account Name")}: {paymentMethod.accountName}
              </Text>
            </VStack>
          )}
          {paymentMethod.paymentType === "Others" && (
            <VStack>
              <Text>{paymentMethod.otherPaymentInfo}</Text>
            </VStack>
          )}
          {paymentMethod.paymentType !== "Bank" &&
            paymentMethod.paymentType !== "Others" && (
              <VStack>
                <Text>
                  {t("Phone Number")}: {paymentMethod.phoneNumber}
                </Text>
                {paymentMethod.identifier && (
                  <Text>
                    {t("ID")}: {paymentMethod.identifier}
                  </Text>
                )}
                <Text>
                  {t("Account Name")}: {paymentMethod.accountName}
                </Text>
              </VStack>
            )}
        </VStack>
        <HStack space={4} alignItems="center">
          <Pressable
            onPress={() => {
              navigation.navigate("ClubAddPaymentMethod", {
                clubId: club?.id,
                editPayMethod: paymentMethod,
              });
            }}
          >
            <PencilIcon alignSelf="center" size="lg" innterFill="#000000" />
          </Pressable>
          <Pressable
            onPress={() => {
              setSelectedRemovePayMethod(paymentMethod);
              setModalOpen((pre) => ({ ...pre, removePayment: true }));
            }}
          >
            <TrashIcon innterFill="red" />
          </Pressable>
        </HStack>
      </HStack>
    );
  };

  const paymentView = () => {
    const staff = user as ClubStaff;
    const isClubAdmin = staff?.clubRelationship === ClubRelationship.Admin;
    if (user?.userType !== UserType.ClubStaff || !isClubAdmin) {
      return <NoAccessRight />;
    }

    return (
      <VStack space={4}>
        <Pressable
          onPress={() => {
            navigation.navigate("ClubAddPaymentMethod", { clubId: club?.id });
          }}
        >
          <HStack
            space={2.5}
            px="defaultLayoutSpacing"
            pb="defaultLayoutSpacing"
            pt="2"
          >
            <AddIconV2 pathColor="#00B812" props={{ size: "md" }} />
            <Heading fontSize={16}>{t("New Payment Method")}</Heading>
          </HStack>
        </Pressable>
        <Divider h="1px" bg="rs.lightGrey" />
        <VStack>
          {!paymentMethodsError &&
            Array.isArray(paymentMethods) &&
            paymentMethods.length > 0 &&
            paymentMethods.map((paymentMethod) =>
              paymentMethodItem(paymentMethod)
            )}
        </VStack>
      </VStack>
    );
  };

  const onDeletePayMethod = async (
    selectedPayMethod: ClubPaymentMethodResponse
  ) => {
    try {
      await deleteClubPaymentMethod(club.id, selectedPayMethod?.id);
      showApiToastSuccess({ title: t("Removed successfully") });
      paymentMethodsMutate();
    } catch (error) {
      showApiToastError(error);
    }
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Manage Club"),
        containerStyle: { marginHorizontal: 0 },
      }}
    >
      <VStack mx="4" space={6} flex={1}>
        <VStack>
          <GhostTabbar
            isShowBottomLine
            isFlex
            defaultIndex={manageTabIndex}
            items={manageTabs}
            onPress={(item: string, index: number) => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setManageTabIndex(index);
            }}
            activateColor={colors.rs.primary_purple}
            unActivateColor={colors.rs.inputLabel_grey}
            tabProps={{
              fontSize: 16,
              textAlign: "center",
              flex: 1,
            }}
          />
        </VStack>

        {manageTabIndex === 0 && applicationsView()}
        {manageTabIndex === 1 && existingView()}
        {manageTabIndex === 2 && paymentView()}
      </VStack>

      <ConfirmationModal
        alertType="Success"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={isModalOpen.confirm}
        onCancel={() => {
          setModalOpen((pre) => ({ ...pre, confirm: false }));
        }}
        title={t("Confirm to approve application?")}
        // description={t("Are you sure to Approve this apply?")}
        onConfirm={async () => {
          setModalOpen((pre) => ({ ...pre, confirm: false }));
          await approveApplication();
        }}
      />
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={isModalOpen.reject}
        onCancel={() => {
          setModalOpen((pre) => ({ ...pre, reject: false }));
        }}
        title={t("Confirm to reject application?")}
        // description={t("Are you sure to Reject this apply?")}
        onConfirm={async () => {
          setModalOpen((pre) => ({ ...pre, reject: false }));
          await rejectApplication();
        }}
      />
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={isModalOpen.remove}
        onCancel={() => {
          setModalOpen((pre) => ({ ...pre, remove: false }));
        }}
        title={
          selectedItem?.candidateInfo.userType === UserType.ClubStaff
            ? t("Confirm to remove staff?")
            : t("Confirm to remove coach?")
        }
        onConfirm={async () => {
          // todo remove api
          setModalOpen((pre) => ({ ...pre, remove: false }));
          await onRemoveClubUser();
        }}
      />

      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={isModalOpen.removePayment}
        onCancel={() => {
          setModalOpen((pre) => ({ ...pre, removePayment: false }));
        }}
        title={t("Confirm to remove \n%{paymentType}", {
          paymentType: selectedRemovePayMethod?.paymentType,
        })}
        description={
          selectedRemovePayMethod
            ? getPaymentMethodDescription(selectedRemovePayMethod)
            : ""
        }
        onConfirm={async () => {
          setModalOpen((pre) => ({ ...pre, removePayment: false }));
          if (selectedRemovePayMethod)
            await onDeletePayMethod(selectedRemovePayMethod);
        }}
      />
    </HeaderLayout>
  );
}
