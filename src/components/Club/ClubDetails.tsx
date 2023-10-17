import React from "react";
import { Heading, HStack, VStack, Text, Image, Avatar } from "native-base";
import { formatFileUrl } from "../../services/ServiceUtil";
import { ClubResponse } from "../../models/responses/Club";
import { getTranslation } from "../../utils/translation";
import { formatUtcToLocalDate } from "../../utils/date";
import ImageDirectory from "../../assets";
import { SCREEN_WIDTH } from "../../constants/constants";
import { formatName } from "../../utils/name";
import LineBreak from "../LineBreak/LineBreak";

const t = getTranslation([
  "constant.district",
  "component.ClubDetails",
  "constant.profile",
]);

export default function ClubDetails({
  club,
  footer,
  type = "card",
}: {
  club: ClubResponse;
  footer?: JSX.Element;
  type?: "card" | "details";
}) {
  let imageSource = ImageDirectory.VENUE;
  if (club?.profilePictureUrl) {
    imageSource = {
      uri: formatFileUrl(club.profilePictureUrl),
    };
  }
  const profileImage = club.adminClubStaffProfilePictureUrl
    ? formatFileUrl(club.adminClubStaffProfilePictureUrl)
    : undefined;

  return (
    <VStack
      space="4"
      bg="rs.white"
      p="defaultLayoutSpacing"
      shadow="9"
      flex={type === "details" ? "1" : "0"}
      borderRadius="2xl"
      style={{
        shadowOffset: {
          width: 5,
          height: 5,
        },
        shadowOpacity: 0.1,
        elevation: 3,
      }}
    >
      {type === "details" && (
        <VStack space="2" mt="1.5">
          <Image
            alt="Club Image"
            source={imageSource}
            flex={1}
            alignSelf="center"
            w="full"
            h={214}
            resizeMode="cover"
          />
          <LineBreak />
          <VStack px="defaultLayoutSpacing" space={1.5}>
            <Heading fontSize="md">{t("Club Name")}</Heading>
            <Text fontSize="md" fontWeight={500}>
              {club?.name}
            </Text>
            <Heading fontSize="md">{t("Club Admin")}</Heading>
            <HStack space="2" alignItems="center">
              <Avatar
                size="xs"
                source={
                  profileImage
                    ? {
                        uri: formatFileUrl(profileImage),
                      }
                    : undefined
                }
              >
                {`${club?.adminClubStaffFirstName?.charAt(
                  0
                )}${club?.adminClubStaffLastName?.charAt(0)}`}
              </Avatar>
              <Text>
                {formatName(
                  club.adminClubStaffFirstName,
                  club.adminClubStaffLastName
                )}
              </Text>
            </HStack>
            <Heading fontSize="md">{t("District")}</Heading>
            <Text fontSize="md">{t(club?.district)}</Text>
            <Heading fontSize="md">{t("Address")}</Heading>
            <Text fontSize="md">{club?.address}</Text>
          </VStack>
        </VStack>
      )}
      {type === "card" && (
        <VStack space="3" mt="1.5" px="defaultLayoutSpacing">
          <Image
            alt="Club Image"
            source={imageSource}
            flex={1}
            borderRadius="2xl"
            alignSelf="center"
            w="full"
            h={170}
            resizeMode="cover"
          />
          <LineBreak />
          <VStack space="2">
            <VStack space={0.5}>
              <Heading fontSize="md">{t("Club Name")}</Heading>
              <Text fontSize="md" fontWeight={500}>
                {club?.name}
              </Text>
            </VStack>
            <Heading fontSize="md">{t("Club Admin")}</Heading>
            <HStack space={2}>
              <Avatar
                size="xs"
                source={
                  profileImage
                    ? {
                        uri: formatFileUrl(profileImage),
                      }
                    : undefined
                }
              >
                {`${club?.adminClubStaffFirstName?.charAt(
                  0
                )}${club?.adminClubStaffLastName?.charAt(0)}`}
              </Avatar>
              <Text>
                {formatName(
                  club.adminClubStaffFirstName,
                  club.adminClubStaffLastName
                )}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      )}
      {footer}
    </VStack>
  );
}
