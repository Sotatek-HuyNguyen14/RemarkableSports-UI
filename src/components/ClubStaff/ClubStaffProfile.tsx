import React from "react";
import {
  Avatar,
  Heading,
  VStack,
  Text,
  Center,
  StyledProps,
  HStack,
  Pressable,
  Image,
} from "native-base";
import { ClubStaff } from "../../models/User";
import { formatFileUrl } from "../../services/ServiceUtil";
import { getTranslation } from "../../utils/translation";
import formatPhone from "../../utils/phone";
import { formatName, getUserName } from "../../utils/name";
import PencilIcon from "../Icons/PencilIcon";
import { ClubStatusType } from "../../models/requests/Club";
import { ClubRelationship } from "../../models/responses/Club";
import Card from "../Card/Card";
import ImageDirectory from "../../assets";

const t = getTranslation([
  "component.ClubStaff.ClubStaffProfile",
  "component.ClubShortProfile",
  "constant.district",
  "constant.profile",
]);

export interface ClubStaffProfileProps {
  clubStaff: ClubStaff;
  ProfileStyleProps?: StyledProps;
  onEdit?: () => void;
  onManage?: () => void;
  onEditClub?: () => void;
  shouldShowEditButton?: boolean;
}

export default function ClubStaffProfile({
  clubStaff,
  ProfileStyleProps,
  onEdit,
  onManage,
  onEditClub,
  shouldShowEditButton = true,
}: ClubStaffProfileProps) {
  const appliedStatus =
    clubStaff?.applyClubStatus || clubStaff?.club?.approvalStatus;
  const shouldDisplayAlternativeScreen =
    appliedStatus !== ClubStatusType.Approved;
  const isClubAdmin = clubStaff?.clubRelationship === ClubRelationship.Admin;
  const isStaff = clubStaff?.clubRelationship === ClubRelationship.Staff;

  const clubCard = () => {
    if (clubStaff.club && !shouldDisplayAlternativeScreen) {
      return (
        <Card
          containerProps={{ p: 0, mx: 4 }}
          body={
            <VStack space="4" borderRadius="xl" pb="defaultLayoutSpacing">
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
                  clubStaff.club?.profilePicture
                    ? { uri: formatFileUrl(clubStaff.club?.profilePicture) }
                    : ImageDirectory.VENUE
                }
              />
              <VStack mx="defaultLayoutSpacing" space="3" mt="2">
                <Heading fontSize="md">{t("Club Name")}</Heading>
                <Text fontSize="md">{clubStaff.club?.name}</Text>
                <Heading fontSize="md">{t("District")}</Heading>
                <Text fontSize="md">{t(clubStaff.club?.district)}</Text>
                <Heading fontSize="md">{t("Address")}</Heading>
                <Text fontSize="md">{clubStaff.club?.address}</Text>

                <HStack space="3" mt="2">
                  {(isStaff || isClubAdmin) && (
                    <Pressable
                      flex="1"
                      bg="rs.primary_purple"
                      justifyContent="center"
                      alignItems="center"
                      px="4"
                      py="3"
                      borderRadius="2xl"
                      onPress={() => {
                        onManage?.();
                      }}
                    >
                      <Text fontWeight="bold" color="rs.white">
                        {t("Manage")}
                      </Text>
                    </Pressable>
                  )}

                  {isClubAdmin && (
                    <Pressable
                      flex="1"
                      bg="rs.white"
                      justifyContent="center"
                      alignItems="center"
                      px="4"
                      py="3"
                      borderRadius="2xl"
                      borderWidth="1"
                      borderColor="rs.primary_purple"
                      onPress={() => {
                        onEditClub?.();
                      }}
                    >
                      <Text fontWeight="bold" color="rs.primary_purple">
                        {t("Edit")}
                      </Text>
                    </Pressable>
                  )}
                </HStack>
              </VStack>
            </VStack>
          }
        />
      );
    }
  };

  return (
    <VStack flex="1" space={6} pb="defaultLayoutSpacing">
      <HStack
        bg="#66CEE126"
        mx="3"
        {...ProfileStyleProps}
        borderRadius="xl"
        justifyContent="space-between"
        p="2"
        alignItems="center"
      >
        <HStack space="3" p="2" flex={1} alignItems="center">
          <Avatar
            size="md"
            source={
              clubStaff.profilePicture
                ? { uri: formatFileUrl(clubStaff.profilePicture) }
                : undefined
            }
          >
            {clubStaff.firstName}
          </Avatar>
          {/* Top general info */}
          <VStack space="1" flex={1}>
            <HStack space="2" alignItems="center">
              <Heading fontSize="md">{getUserName(clubStaff)}</Heading>
              <HStack
                bg="#66CEE1"
                width="5"
                h="5"
                borderRadius="full"
                justifyContent="center"
                alignItems="center"
              >
                <Text style={{ fontSize: 10 }}>
                  {clubStaff.sex.charAt(0).toUpperCase()}
                </Text>
              </HStack>
            </HStack>
            <HStack>
              <Text numberOfLines={2} flexWrap="wrap">
                {clubStaff.email}
              </Text>
              {/* <Text numberOfLines={2} flexWrap="wrap">
                {`@${clubStaff.email.split("@")[1]}`}
              </Text> */}
            </HStack>
            <Text>
              {t("Mobile")} {formatPhone(clubStaff.mobile)}
            </Text>
          </VStack>
        </HStack>
        {shouldShowEditButton && (
          <Pressable
            onPress={() => {
              onEdit?.();
            }}
            mr="3"
          >
            <PencilIcon size="lg" />
          </Pressable>
        )}
      </HStack>
      {/* Club info */}
      {clubCard()}
    </VStack>
  );
}
