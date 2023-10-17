import {
  HStack,
  Button,
  Text,
  Badge,
  VStack,
  Image,
  Heading,
  Pressable,
} from "native-base";
import React from "react";
import { View } from "react-native";
import { ClubHomeNavigationProp } from ".";
import ImageDirectory from "../../../assets";
import Card from "../../../components/Card/Card";
import CreateJoinClubCard from "../../../components/Card/CreateJoinClubCard";
import { ClubStatusType } from "../../../models/requests/Club";
import { ClubRelationship } from "../../../models/responses/Club";
import { ClubStaff } from "../../../models/User";
import { formatFileUrl } from "../../../services/ServiceUtil";
import { isBlank } from "../../../utils/strings";
import { getTranslation } from "../../../utils/translation";

const t = getTranslation([
  "component.CreateJoinClub",
  "component.ClubStaff.ClubStaffProfile",
  "component.ClubShortProfile",
  "constant.district",
  "constant.profile",
  "constant.button",
]);

export interface CreateJoinClubProps {
  staff: ClubStaff;
  navigation: ClubHomeNavigationProp;
  onCancel?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function CreateJoinClub({
  staff,
  navigation,
  onCancel,
  onDelete,
  onEdit,
}: CreateJoinClubProps) {
  const appliedStatus = staff.applyClubStatus || staff.club?.approvalStatus;
  const rejectReason = staff.club?.rejectReason;
  if (appliedStatus === ClubStatusType.Pending) {
    // Show pending approval club component
    return (
      <Card
        containerProps={{ p: 0, mx: 4 }}
        body={
          <VStack borderRadius="xl" pb="defaultLayoutSpacing">
            <View
              style={{ position: "absolute", right: 15, top: 15, zIndex: 1 }}
            >
              <Badge
                bgColor={
                  staff.clubRelationship === ClubRelationship.Admin
                    ? "rs.GPP_orange"
                    : "rs.primary_purple"
                }
                px="2"
                py="1"
                shadow="9"
                borderRadius="2xl"
                style={{
                  shadowOffset: {
                    width: 5,
                    height: 5,
                  },
                  shadowOpacity: 0.1,
                  elevation: 3,
                }}
                _text={{
                  color: "rs.white",
                  fontSize: "xs",
                }}
              >
                {t("Waiting for approval")}
              </Badge>
            </View>
            <Image
              w="100%"
              style={{
                width: "100%",
                height: 220,
                borderTopRightRadius: 8,
                borderTopLeftRadius: 8,
              }}
              alt="clubImg"
              source={
                staff.club?.profilePicture
                  ? { uri: formatFileUrl(staff.club?.profilePicture) }
                  : ImageDirectory.VENUE
              }
            />
            <VStack mx="defaultLayoutSpacing" space="3" mt="2">
              <Heading fontSize="md">{t("Club Name")}</Heading>
              <Text fontSize="md">{staff.club?.name}</Text>
              <Heading fontSize="md">{t("District")}</Heading>
              {staff.club?.district && !isBlank(staff.club.district) && (
                <Text fontSize="md">{t(staff.club?.district)}</Text>
              )}
              <Heading fontSize="md">{t("Address")}</Heading>
              <Text fontSize="md">{staff.club?.address}</Text>

              {staff.clubRelationship !== ClubRelationship.Admin && (
                <Pressable
                  flex="1"
                  mt="4"
                  bg="rs.primary_purple"
                  justifyContent="center"
                  alignItems="center"
                  px="4"
                  py="3"
                  borderRadius="2xl"
                  onPress={() => {
                    onCancel?.();
                  }}
                >
                  <Text fontWeight="bold" color="rs.white">
                    {t("Cancel")}
                  </Text>
                </Pressable>
              )}

              {staff.clubRelationship === ClubRelationship.Admin && (
                <HStack space={2}>
                  <Pressable
                    flex="1"
                    mt="4"
                    bg="rs.primary_purple"
                    justifyContent="center"
                    alignItems="center"
                    px="4"
                    py="3"
                    borderRadius="2xl"
                    onPress={() => {
                      onEdit?.();
                    }}
                  >
                    <Text fontWeight="bold" color="rs.white">
                      {t("Edit")}
                    </Text>
                  </Pressable>
                  <Pressable
                    flex="1"
                    mt="4"
                    bg="rs.white"
                    borderColor="rs.primary_purple"
                    borderWidth={1}
                    justifyContent="center"
                    alignItems="center"
                    px="4"
                    py="3"
                    borderRadius="2xl"
                    onPress={() => {
                      onDelete?.();
                    }}
                  >
                    <Text fontWeight="bold" color="rs.primary_purple">
                      {t("Delete")}
                    </Text>
                  </Pressable>
                </HStack>
              )}
            </VStack>
          </VStack>
        }
      />
    );
  }

  return (
    <VStack px="defaultLayoutSpacing">
      {/* display Create club Join club */}
      {appliedStatus !== ClubStatusType.Approved && (
        <VStack space="4">
          {appliedStatus !== ClubStatusType.Pending && (
            <VStack mt="2" mb="4" space={2.5}>
              <CreateJoinClubCard
                title={t("Create Club")}
                onPress={() => {
                  navigation.navigate("ClubAddClub");
                }}
                description={t("Check for availability now")}
              />
              <CreateJoinClubCard
                title={t("Join Club")}
                onPress={() => {
                  navigation.navigate("JoinClubScreen");
                }}
                type="join"
                description={t("Check for availability now")}
              />
            </VStack>
          )}
          {/* {appliedStatus && (
            <Badge
              bgColor="rs_secondary.orange"
              p="2"
              shadow="9"
              w="32"
              borderRadius="xl"
              style={{
                shadowOffset: {
                  width: 5,
                  height: 5,
                },
                shadowOpacity: 0.1,
                elevation: 3,
              }}
            >
              {t(appliedStatus)}
            </Badge>
          )} */}
          {/* {rejectReason && appliedStatus === ClubStatusType.Rejected && (
            <Text fontSize="md">{`${t(
              "Rejected Reason"
            )}: ${rejectReason}`}</Text>
          )} */}
        </VStack>
      )}
    </VStack>
  );
}
