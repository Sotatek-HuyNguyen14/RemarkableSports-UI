/* eslint-disable react/no-array-index-key */
import React from "react";
import {
  Avatar,
  Heading,
  HStack,
  VStack,
  Text,
  Center,
  StyledProps,
  Box,
  Divider,
  Badge,
  Pressable,
} from "native-base";
import { Coach, Player } from "../../models/User";
import { formatFileUrl } from "../../services/ServiceUtil";
import { getTranslation } from "../../utils/translation";
import formatPhone from "../../utils/phone";
import { formatName, getUserName } from "../../utils/name";
import { ClubStatusType } from "../../models/requests/Club";
import { isBlank } from "../../utils/strings";
import { formatDateToCalendar } from "../../utils/date";
import { useAuth } from "../../hooks/UseAuth";
import { formatId } from "../../models/responses/Calendar";

const t = getTranslation([
  "component.Coach.CoachProfile",
  "constant.district",
  "constant.profile",
]);

export interface CoachProfileProps {
  coach: Coach;
  ProfileStyleProps?: StyledProps;
  onPressJoinClub?: () => void;
  isHorizontalAvatarAndName?: Boolean;
  isOther?: Boolean;
}

export function ProfileBox({
  title,
  description,
  shouldBoldTitle,
  bg = "#66CEE133",
  shouldBoldDesc = true,
  w,
}: {
  title?: string;
  description: string;
  shouldBoldTitle?: boolean;
  bg?: string;
  shouldBoldDesc?: boolean;
  w?: string;
}) {
  return (
    <VStack
      w={w || "45%"}
      justifyContent={!shouldBoldDesc ? "center" : "flex-start"}
      alignItems={shouldBoldDesc ? "center" : "flex-start"}
      bg={bg}
      px="4"
      py="4"
      space="3"
      borderRadius="xl"
    >
      {title && (
        <Text
          color={shouldBoldTitle ? "rs.black" : "#909090"}
          fontSize={shouldBoldTitle ? "lg" : "xs"}
          fontWeight={shouldBoldTitle ? "bold" : "normal"}
        >
          {title}
        </Text>
      )}
      <Text fontSize="lg" fontWeight={shouldBoldDesc ? "bold" : "normal"}>
        {description}
      </Text>
    </VStack>
  );
}

export default function CoachProfile({
  coach,
  ProfileStyleProps,
  onPressJoinClub,
  isHorizontalAvatarAndName = false,
  isOther = false,
}: CoachProfileProps) {
  const yearsAsPlayer = new Date().getFullYear() - coach.startYearAsPlayer;
  const yearsAsCoach = new Date().getFullYear() - coach.startYearAsCoach;

  const level = coach.playerLevel ? t(coach.playerLevel) : "-";
  const rank = coach.ranking || "-";
  const levelRanking =
    !coach.playerLevel && !coach.ranking ? "-" : `${level} (${rank})`;
  const clubs = coach.clubCoaches?.filter((club) => {
    return club.coachId === coach.id && club.approvalStatus === "Approved";
  });

  const { user } = useAuth();

  const shouldShowPendingAprovalClub = user?.id === coach.id;
  const pendingApprovalClubs = coach.clubCoaches?.filter((club) => {
    return club.coachId === coach.id && club.approvalStatus === "Pending";
  });

  return (
    <VStack flex="1" space="2" {...ProfileStyleProps}>
      {/* Top general info */}
      <VStack space="3">
        {isHorizontalAvatarAndName ? (
          <HStack
            w="100%"
            justifyContent="center"
            alignItems="center"
            space="10"
            mb="2"
          >
            <Avatar
              size="lg"
              alignSelf="center"
              source={
                coach.profilePicture
                  ? { uri: formatFileUrl(coach.profilePicture) }
                  : undefined
              }
            >
              {coach.firstName}
            </Avatar>
            <HStack alignItems="center" space="2" alignSelf="center">
              <HStack
                bg="#66CEE1"
                width="6"
                h="6"
                borderRadius="full"
                justifyContent="center"
                alignItems="center"
              >
                <Text>{coach.sex.charAt(0).toUpperCase()}</Text>
              </HStack>
              <Heading fontSize="lg">{getUserName(coach)}</Heading>
            </HStack>
          </HStack>
        ) : (
          <>
            {/* Avatar */}
            <Avatar
              size="lg"
              alignSelf="center"
              source={
                coach.profilePicture
                  ? { uri: formatFileUrl(coach.profilePicture) }
                  : undefined
              }
            >
              {coach.firstName}
            </Avatar>
            <HStack alignItems="center" space="2" alignSelf="center">
              <HStack
                bg="#66CEE1"
                width="6"
                h="6"
                borderRadius="full"
                justifyContent="center"
                alignItems="center"
              >
                <Text>{coach.sex.charAt(0).toUpperCase()}</Text>
              </HStack>
              <Heading fontSize="md">{getUserName(coach)}</Heading>
            </HStack>
            <Divider w="95%" alignSelf="center" />
          </>
        )}

        {/* Level & Experience */}
        <HStack w="100%" alignItems="center" justifyContent="center" space="3">
          <ProfileBox
            title={`${t("Coach Level")}`}
            description={coach.coachLevel ? t(coach.coachLevel) : "-"}
          />
          <ProfileBox
            title={t("Experience")}
            description={`${yearsAsCoach.toString()} ${t("Years")}`}
          />
        </HStack>

        {/* Player level & Experience */}
        <HStack w="100%" alignItems="center" justifyContent="center" space="3">
          <ProfileBox
            title={`${t("Player Level")} (${t("Ranking")})`}
            description={levelRanking}
          />
          <ProfileBox
            title={t("Player Experience")}
            description={`${yearsAsPlayer.toString()} ${t("Years")}`}
          />
        </HStack>

        {/* Left hand & Style */}
        <HStack w="100%" alignItems="center" justifyContent="center" space="3">
          <ProfileBox
            shouldBoldTitle
            title={t(`${coach.handUsed} Hand`)}
            description={coach.blade ? t(coach.blade) : "-"}
          />
          <ProfileBox title={t("Style")} description={t(coach.style)} />
        </HStack>

        {/* Rubber & Back rubber */}
        <HStack w="100%" alignItems="center" justifyContent="center" space="3">
          <ProfileBox
            title={t("Rubber")}
            description={coach.rubber ? t(coach.rubber) : "-"}
          />
          <ProfileBox
            title={t("Back rubber")}
            description={coach.backRubber ? t(coach.backRubber) : "-"}
          />
        </HStack>

        <Divider w="95%" alignSelf="center" />

        {/* Dob & Mobile */}
        {!isOther && (
          <>
            <ProfileBox
              bg="rs.white"
              title={t("Date of birth")}
              description={
                coach.dateOfBirth
                  ? formatDateToCalendar(coach.dateOfBirth)
                  : "-"
              }
              shouldBoldDesc={false}
            />
            <Divider w="95%" alignSelf="center" />
          </>
        )}
        <ProfileBox
          bg="rs.white"
          title={t("Mobile")}
          description={coach.mobile ? formatPhone(coach.mobile) : "-"}
          shouldBoldDesc={false}
        />

        <Divider w="95%" alignSelf="center" />
        {!isOther && (
          <>
            <ProfileBox
              w="100%"
              title={t("Email")}
              description={coach.email ? coach.email : "-"}
              shouldBoldDesc={false}
              bg="rs.white"
            />

            <Divider w="95%" alignSelf="center" />
          </>
        )}
        <ProfileBox
          w="100%"
          title={t("Price / hour")}
          description={coach.fee ? coach.fee.toString() : "-"}
          shouldBoldDesc={false}
          bg="rs.white"
        />

        <Divider w="95%" alignSelf="center" />

        {/* District  */}
        <Text ml="4" color="#909090" fontSize="sm">
          {t("Districts")}
        </Text>
        <HStack ml="4" width="100%" flexWrap="wrap">
          {coach.districts.map((d, index) => {
            const isSelected = true;
            const color = isSelected ? "#66CEE1" : "#BEBEBE";
            return (
              <Badge
                key={`CoachProfile_${d}${index}`}
                borderColor={color}
                variant="outline"
                bg="rs.white"
                _text={{ color, fontSize: 14 }}
                m={1}
                maxW="40"
                p="1"
                px="2"
                borderRadius="xl"
              >
                {t(d)}
              </Badge>
            );
          })}
        </HStack>
        <Divider w="95%" alignSelf="center" />

        <ProfileBox
          title={t("Lisence No")}
          description={coach.licenseNumber || "-"}
          shouldBoldDesc={false}
          bg="rs.white"
        />
        <Divider w="95%" alignSelf="center" />

        <ProfileBox
          title={t("HKTTA ID")}
          description={coach.hkttaId || "-"}
          shouldBoldDesc={false}
          bg="rs.white"
        />

        <Divider w="95%" alignSelf="center" />

        <ProfileBox
          w="100%"
          title={t("Description")}
          description={coach.description || "-"}
          shouldBoldDesc={false}
          bg="rs.white"
        />

        <Divider w="95%" alignSelf="center" />

        <VStack px="4" py="4" space="2">
          <Text color="#909090" fontSize="xs">
            {t("Achievement")}
          </Text>
          {coach.achievements &&
            coach.achievements?.map((achievement) => {
              return (
                <HStack space="2" alignItems="center" key={achievement}>
                  <HStack w="2" h="2" bg="black" borderRadius="full" />
                  <Text fontSize="lg">{achievement}</Text>
                </HStack>
              );
            })}
        </VStack>
        <Divider w="95%" alignSelf="center" />
        <HStack ml="4" alignItems="center" justifyContent="space-between">
          <Text color="#909090" fontSize="sm">
            {t("Club")}
          </Text>
          {user?.id === coach.id && (
            <Pressable
              onPress={() => {
                onPressJoinClub();
              }}
              bg="#66CEE1"
              p="2"
            >
              <Text>{`+ ${t("Join club")}`}</Text>
            </Pressable>
          )}
        </HStack>
        <VStack mx="8">
          {clubs &&
            clubs.length > 0 &&
            clubs.map((club) => {
              return (
                <HStack space="2" alignItems="center" key={club.clubId}>
                  <HStack w="2" h="2" bg="black" borderRadius="full" />
                  <Text fontSize="lg">{club.club.name}</Text>
                </HStack>
              );
            })}
        </VStack>
        <VStack mx="8">
          {pendingApprovalClubs &&
            shouldShowPendingAprovalClub &&
            pendingApprovalClubs.length > 0 &&
            pendingApprovalClubs.map((club) => {
              return (
                <HStack space="2" alignItems="center" key={club.clubId}>
                  <HStack w="2" h="2" bg="black" borderRadius="full" />
                  <Text fontSize="lg">{`${club.club.name} (${t(
                    "Waiting for Approval"
                  )})`}</Text>
                </HStack>
              );
            })}
        </VStack>
      </VStack>
    </VStack>
  );
}
