/* eslint-disable no-param-reassign */
import React, { useState } from "react";
import useSWR from "swr";
import {
  useTheme,
  VStack,
  Button,
  Toast,
  Heading,
  Image,
  HStack,
  Text,
  Pressable,
  Badge,
  Avatar,
  Box,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useForm } from "react-hook-form";
import { LayoutAnimation } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../routers/Types";
import {
  formatCoreUrl,
  formatFileUrl,
  formatMeetupApiUrl,
} from "../../services/ServiceUtil";
import {
  bookVenueV2,
  deleteVenueBooking,
  getVenueBookingById,
  isVenueBookingAbsent,
  isVenueBookingCancelled,
  isVenueBookingPast,
  isVenueBookingUpcoming,
  updateVenueBooking,
} from "../../services/VenueBookingServices";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { getTranslation } from "../../utils/translation";
import { VenueBooking, VenueBookingStatus } from "../../models/Booking";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { showApiToastError } from "../../components/ApiToastError";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import {
  APPROVE_BUTTON_COLOR,
  REJECT_BUTTON_COLOR,
  SCREEN_WIDTH,
} from "../../constants/constants";
import ImageDirectory from "../../assets";
import LocationIcon from "../../components/Icons/LocationIcon";
import {
  format24HTo12H,
  formatUtcToLocalDate,
  formatUtcToLocalTime,
} from "../../utils/date";
import RectangleBlueCheckIcon from "../../components/Icons/RectangleBlueCheckIcon";
import ChooseIcon from "../../components/Icons/ChooseIcon";
import EmptyBoxIcon from "../../components/Icons/EmptyBoxIcon";
import FormInput from "../../components/FormInput/FormInput";
import { Venue } from "../../models/requests/Venue";
import GhostTabbar from "../../components/GhostTabBar";
import {
  approveVenueBooking,
  getManageBookings,
  getVenueBookingForVenue,
  isVenueBookingFinished,
  rejectVenueBooking,
} from "../../services/VenueBooking";
import { getUserName } from "../../utils/name";
import { showApiToastSuccess } from "../../components/ApiToastSuccess";
import RejectWithReasonModal from "../../components/Modal/RejectWithReasonModal";
import NoDataComponent from "../../components/NoDataComponent";
import ReminderIcon from "../../components/Icons/ReminderIcon";

type BookingAdditionalInformationScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ManageBookings"
>;

const t = getTranslation([
  "constant.district",
  "screen.BookVenue",
  "constant.button",
  "screen.BookingRecords",
  "constant.district",
  "component.BookingAdditionalInformations",
  "screen.PlayerScreens.VenueBookingDetails",
  "component.VenueBookingDetails",
]);

interface FormValue {
  remark: string;
}

export enum VenueBookingGroup {
  GroupBooking = "GroupBooking",
  PublicCourse = "PublicCourse",
  PrivateCourse = "PrivateCourse",
  PersonalCoach = "PersonalCoach",
  Event = "Event",
  Others = "Others",
}

export default function ManageBookings({
  route,
  navigation,
}: BookingAdditionalInformationScreenProps) {
  const { venue } = route.params;
  const theme = useTheme();
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [applicationViewActiveIndex, setApplicationViewActiveIndex] =
    useState(0);
  const [cancelBooking, setCancelBooking] = useState(false);
  const [absentModal, setAbsentModal] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState<boolean>(false);
  const [recordsViewActiveIndex, setRecordsViewActiveIndex] = useState(0);
  const [selectedVenueBooking, setSelectedVenueBooking] =
    useState<VenueBooking>();
  const {
    data: venueApplications,
    mutate,
    isValidating,
  } = useSWR(formatCoreUrl("/meetup/venue"), () => getManageBookings(venue.id));

  const unwrappedVenueApplications = venueApplications || [];
  const pendingVenueApplications = unwrappedVenueApplications.filter((v) => {
    // return true;
    return v.status === VenueBookingStatus.Pending;
  });
  const rejectedVenueApplications = unwrappedVenueApplications.filter((v) => {
    // return true;
    return v.status === VenueBookingStatus.Rejected;
  });
  const upcomingVenueApplications = unwrappedVenueApplications.filter((v) => {
    // return true;
    return isVenueBookingUpcoming(v);
  });
  const cancelledVenueApplications = unwrappedVenueApplications.filter((v) => {
    // return true;
    return isVenueBookingCancelled(v);
  });
  const absentVenueApplications = unwrappedVenueApplications.filter((v) => {
    // return true;
    return isVenueBookingAbsent(v);
  });
  const pastVenueApplications = unwrappedVenueApplications.filter((v) => {
    // return true;
    return isVenueBookingPast(v);
  });

  useFocusEffect(
    React.useCallback(() => {
      mutate();
    }, [mutate])
  );

  const approveRejectFooter = (booking: VenueBooking) => {
    return (
      <HStack mt="4" space={3}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            // Aprove
            setSelectedVenueBooking(booking);
            setConfirmApprove(true);
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
            // Reject
            setSelectedVenueBooking(booking);
            setRejectModalVisible(true);
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
    );
  };

  const absentCancelFooter = (booking: VenueBooking) => {
    return (
      <HStack mt="4" space={3}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            // Absent
            setSelectedVenueBooking(booking);
            setAbsentModal(true);
          }}
        >
          <Box
            bg="rs.primary_purple"
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
              {t("Absent")}
            </Text>
          </Box>
        </Pressable>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            // Cancel
            setSelectedVenueBooking(booking);
            setCancelBooking(true);
          }}
        >
          <Box
            bg="rs.white"
            h="10"
            flex={1}
            borderWidth={0.5}
            borderColor="rs.primary_purple"
            borderRadius={16}
            alignItems="center"
            justifyContent="center"
          >
            <Text
              fontWeight="bold"
              fontSize="md"
              textAlign="center"
              color="rs.primary_purple"
            >
              {t("Cancel")}
            </Text>
          </Box>
        </Pressable>
      </HStack>
    );
  };

  const revertFooter = (booking: VenueBooking) => {
    return (
      <Pressable
        mt="3"
        style={{ flex: 1 }}
        onPress={async () => {
          try {
            await updateVenueBooking({
              id: booking.id,
              action: "Revert",
            });
            showApiToastSuccess({});
            mutate();
          } catch (e) {
            showApiToastError(e);
          }
        }}
      >
        <Box
          bg="rs.white"
          h="10"
          flex={1}
          borderWidth="1"
          borderColor="rs.primary_purple"
          borderRadius={16}
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontWeight="bold"
            fontSize="md"
            textAlign="center"
            color="rs.primary_purple"
          >
            {t("Revert")}
          </Text>
        </Box>
      </Pressable>
    );
  };

  const renderListData = (
    data: VenueBooking[],
    footerType: "none" | "approve-reject" | "absent-cancel" | "revert"
  ) => {
    if (data.length === 0) {
      return <NoDataComponent />;
    }
    return (
      <VStack space="4">
        {data.map((booking) => {
          return (
            <Pressable
              onPress={() => {
                navigation.navigate("ClubVenueBookingDetails", {
                  venueBookingId: booking.id,
                  flow:
                    footerType === "absent-cancel"
                      ? "ReopenAndRefund"
                      : "default",
                });
              }}
              key={booking.id}
            >
              <VStack
                m="2"
                p="4"
                py="5"
                borderRadius="2xl"
                shadow="9"
                style={{
                  shadowOffset: {
                    width: 5,
                    height: 5,
                  },
                  shadowOpacity: 0.1,
                  elevation: 3,
                }}
                bg="white"
              >
                <HStack space="3">
                  <Avatar
                    size="sm"
                    source={
                      booking.bookerInfo.profilePicture
                        ? {
                            uri: formatFileUrl(
                              booking.bookerInfo.profilePicture
                            ),
                          }
                        : ImageDirectory.DRAFT_AVT
                    }
                  >
                    Thumbnail
                  </Avatar>
                  <VStack space="1">
                    <Text fontSize="md">{getUserName(booking.bookerInfo)}</Text>
                    {[
                      `${t("Date")}: ${booking.selectedDate}`,
                      `${t("Time-slots")}: ${formatUtcToLocalTime(
                        new Date(booking.fromTime)
                      )} - ${formatUtcToLocalTime(new Date(booking.toTime))}`,
                      `${t("No of Tables")}: ${booking.noOfTables}`,
                      `${t("Amount")}: $${booking.amount}`,
                    ].map((value) => {
                      return (
                        <Text key={value} fontSize="sm" color="#6D6D6D">
                          {value}
                        </Text>
                      );
                    })}
                    <Pressable
                      _pressed={{ opacity: 0.5 }}
                      onPress={() => {
                        navigation.navigate("UserProfileViewer", {
                          user: {
                            ...booking.bookerInfo,
                          },
                        });
                      }}
                    >
                      <Text color="rs.primary_purple">
                        {t("Player details")}
                        {">"}
                      </Text>
                    </Pressable>
                  </VStack>
                </HStack>

                {footerType === "absent-cancel" ? (
                  absentCancelFooter(booking)
                ) : footerType === "approve-reject" ? (
                  approveRejectFooter(booking)
                ) : footerType === "revert" ? (
                  revertFooter(booking)
                ) : (
                  <VStack />
                )}
              </VStack>
            </Pressable>
          );
        })}
      </VStack>
    );
  };

  const applicationView = () => {
    return (
      <VStack space="2" flex="1">
        <GhostTabbar
          defaultIndex={applicationViewActiveIndex}
          items={[
            `${t("Pending")} (${pendingVenueApplications.length})`,
            `${t("Rejected")} (${rejectedVenueApplications.length})`,
          ]}
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setApplicationViewActiveIndex(index);
          }}
          activateColor={theme.colors.rs.primary_purple}
          unActivateColor={theme.colors.rs.inputLabel_grey}
          tabProps={{
            fontSize: 16,
            textAlign: "center",
            flex: 1,
          }}
        />
        {renderListData(
          applicationViewActiveIndex === 0
            ? pendingVenueApplications
            : rejectedVenueApplications,
          applicationViewActiveIndex === 0 ? "approve-reject" : "none"
        )}
      </VStack>
    );
  };

  const recordsView = () => {
    return (
      <VStack space="2" flex="1">
        <GhostTabbar
          defaultIndex={recordsViewActiveIndex}
          items={[
            `${t("Upcoming")} (${upcomingVenueApplications.length})`,
            `${t("Cancelled")} (${cancelledVenueApplications.length})`,
            `${t("Absent")} (${absentVenueApplications.length})`,
            `${t("Past")} (${pastVenueApplications.length})`,
          ]}
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setRecordsViewActiveIndex(index);
          }}
          activateColor={theme.colors.rs.primary_purple}
          unActivateColor={theme.colors.rs.inputLabel_grey}
          tabProps={{
            fontSize: 16,
            textAlign: "center",
            flex: 1,
          }}
        />
        {renderListData(
          recordsViewActiveIndex === 0
            ? upcomingVenueApplications
            : recordsViewActiveIndex === 1
            ? cancelledVenueApplications
            : recordsViewActiveIndex === 2
            ? absentVenueApplications
            : pastVenueApplications,
          recordsViewActiveIndex === 0
            ? "absent-cancel"
            : recordsViewActiveIndex === 2
            ? "revert"
            : "none"
        )}
      </VStack>
    );
  };

  if (isValidating) {
    return <Loading />;
  }

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: t("Bookings"),
      }}
    >
      <VStack space="4" mx="defaultLayoutSpacing">
        {/* Venue name + Address */}
        <VStack
          mb="2"
          borderRadius="xl"
          p="4"
          bg="#66CEE11A"
          justifyContent="center"
        >
          <Heading fontSize="md">{venue.name}</Heading>
          <Text>{venue.address}</Text>
        </VStack>
        {/* Tab bar */}
        <GhostTabbar
          isShowBottomLine
          isFlex
          defaultIndex={activeTabIndex}
          items={[t("Applications"), t("Records")]}
          onPress={(item: string, index: number) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setActiveTabIndex(index);
          }}
          activateColor={theme.colors.rs.primary_purple}
          unActivateColor={theme.colors.rs.inputLabel_grey}
          tabProps={{
            fontSize: 16,
            textAlign: "center",
            flex: 1,
          }}
        />
        {/* Application view */}
        {activeTabIndex === 0 && applicationView()}
        {/* Records */}
        {activeTabIndex === 1 && recordsView()}
      </VStack>
      <ConfirmationModal
        alertType="Success"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={confirmApprove}
        onCancel={() => {
          setConfirmApprove(false);
        }}
        title={t("Confirm to approve application")}
        onConfirm={async () => {
          setConfirmApprove(false);
          if (selectedVenueBooking)
            approveVenueBooking({ venueId: selectedVenueBooking.id })
              .then(() => {
                showApiToastSuccess({});
                mutate();
              })
              .catch((e) => {
                showApiToastError(e);
              });
        }}
      />
      <ConfirmationModal
        description={t(
          "No refund will be applied to the applicant and the time slots will be re-opened"
        )}
        customizeIcon={
          <Box
            w="12"
            h="12"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            mr="defaultLayoutSpacing"
            bg="rgba(5,105,255,0.15)"
          >
            <ReminderIcon />
          </Box>
        }
        alertType="customize"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={absentModal}
        onConfirm={async () => {
          setAbsentModal(false);
          if (selectedVenueBooking) {
            try {
              await updateVenueBooking({
                id: selectedVenueBooking.id,
                action: "Absent",
              });
              showApiToastSuccess({});
              mutate();
            } catch (e) {
              showApiToastError(e);
            }
          }
        }}
        onCancel={() => {
          setAbsentModal(false);
        }}
        title={t("Confirm to mark this booking as absent")}
      />
      <ConfirmationModal
        alertType="Fail"
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
        isOpen={cancelBooking}
        onConfirm={async () => {
          setCancelBooking(false);
          if (selectedVenueBooking) {
            try {
              // await deleteVenueBooking(selectedVenueBooking.id);
              await updateVenueBooking({
                id: selectedVenueBooking.id,
                action: "Cancelled",
              });
              showApiToastSuccess({});
              mutate();
            } catch (e) {
              showApiToastError(e);
            }
          }
        }}
        onCancel={() => {
          setCancelBooking(false);
        }}
        title={t("Confirm to cancel booking")}
      />
      {selectedVenueBooking && rejectModalVisible && (
        <RejectWithReasonModal
          isOpen={rejectModalVisible}
          onClose={() => setRejectModalVisible(false)}
          onPressSubmit={(msg) => {
            if (selectedVenueBooking) {
              rejectVenueBooking({
                venueId: selectedVenueBooking.id,
                rejectReason: msg,
              })
                .then(() => {
                  setRejectModalVisible(false);
                  showApiToastSuccess({});
                  mutate();
                })
                .catch((er) => {
                  showApiToastError(er);
                });
            }
          }}
          user={selectedVenueBooking.bookerInfo}
          rejectObject={selectedVenueBooking.venue}
        />
      )}
    </HeaderLayout>
  );
}
