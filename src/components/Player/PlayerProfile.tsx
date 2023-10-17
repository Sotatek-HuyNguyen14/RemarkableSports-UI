import React from "react";
import {
  Avatar,
  Heading,
  HStack,
  VStack,
  Text,
  StyledProps,
  Divider,
  Pressable,
} from "native-base";
import { Coach, Player } from "../../models/User";
import { formatFileUrl } from "../../services/ServiceUtil";
import { getTranslation } from "../../utils/translation";
import formatPhone from "../../utils/phone";
import { formatName, getUserName } from "../../utils/name";
import { ProfileBox } from "../Coach/CoachProfile";
import { formatDateToCalendar } from "../../utils/date";
import { useAuth } from "../../hooks/UseAuth";
import { ClubRelationship } from "../../models/responses/Club";

export interface PlayerProfileProps {
  player: Player;
  ProfileStyleProps?: StyledProps;
  onPressJoinClub?: () => void;
  isOther?: Boolean;
}

const t = getTranslation([
  "component.Player.PlayerProfile",
  "constant.district",
  "constant.profile",
  "component.Coach.CoachProfile",
]);

export default function PlayerProfile({
  player,
  ProfileStyleProps,
  onPressJoinClub,
  isOther = false,
}: PlayerProfileProps) {
  const { user } = useAuth();
  const yearsAsPlayer = new Date().getFullYear() - player.startYearAsPlayer;
  const level = player.playerLevel ? t(player.playerLevel) : "-";
  const rank = player.ranking || "-";
  const levelRanking =
    `${level} (${rank})` === "- (-)" ? "-" : `${level} (${rank})`;

  const clubs = player?.clubPlayers?.filter((club) => {
    return club.playerId === player.id && club.approvalStatus === "Approved";
  });

  const shouldShowPendingAprovalClub = user?.id === player.id;
  const pendingApprovalClubs = player?.clubPlayers?.filter((club) => {
    return club.playerId === player.id && club.approvalStatus === "Pending";
  });
  return (
    <VStack flex="1" space="2" {...ProfileStyleProps}>
      {/* Top general info */}
      <VStack space="3">
        {/* Avatar */}
        <Avatar
          size="lg"
          alignSelf="center"
          source={
            player.profilePicture
              ? { uri: formatFileUrl(player.profilePicture) }
              : undefined
          }
        >
          {player.firstName}
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
            <Text>{player.sex.charAt(0).toUpperCase()}</Text>
          </HStack>
          <Heading fontSize="md">{getUserName(player)}</Heading>
        </HStack>
        <Divider w="95%" alignSelf="center" />
        {/* Level & Experience */}
        <HStack w="100%" alignItems="center" justifyContent="center" space="3">
          <ProfileBox
            title={`${t("PlayerLevel")} (${t("Ranking")})`}
            description={levelRanking}
          />
          <ProfileBox
            title={t("Player Experience")}
            description={
              player.startYearAsPlayer && player.startYearAsPlayer !== 0
                ? `${yearsAsPlayer.toString()} ${t("Years")}`
                : "-"
            }
          />
        </HStack>

        {/* Left hand & Style */}
        <HStack w="100%" alignItems="center" justifyContent="center" space="3">
          <ProfileBox
            shouldBoldTitle
            title={t(`${player.handUsed} Hand`)}
            description={player.blade ? t(player.blade) : "-"}
          />
          <ProfileBox
            title={t("Style")}
            description={player.style ? t(player.style) : "-"}
          />
        </HStack>

        {/* Rubber & Back rubber */}
        <HStack w="100%" alignItems="center" justifyContent="center" space="3">
          <ProfileBox
            title={t("Rubber")}
            description={player.rubber ? t(player.rubber) : "-"}
          />
          <ProfileBox
            title={t("Back rubber")}
            description={player.backRubber ? t(player.backRubber) : "-"}
          />
        </HStack>

        <Divider w="95%" alignSelf="center" />

        {/* Dob & Mobile */}
        {!isOther && (
          <ProfileBox
            bg="rs.white"
            title={t("Date of birth")}
            description={
              player.dateOfBirth
                ? formatDateToCalendar(player.dateOfBirth)
                : "-"
            }
            shouldBoldDesc={false}
          />
        )}
        <Divider w="95%" alignSelf="center" />
        <ProfileBox
          bg="rs.white"
          title={t("Mobile")}
          description={player.mobile ? formatPhone(player.mobile) : "-"}
          shouldBoldDesc={false}
        />

        <Divider w="95%" alignSelf="center" />
        {!isOther && (
          <>
            <ProfileBox
              w="100%"
              title={t("Email")}
              description={player.email || "-"}
              shouldBoldDesc={false}
              bg="rs.white"
            />

            <Divider w="95%" alignSelf="center" />
          </>
        )}
        <HStack w="100%" alignItems="center" space="3">
          <ProfileBox
            title={t("HKTTA ID")}
            description={player.hkttaId || "-"}
            shouldBoldDesc={false}
            bg="rs.white"
          />
        </HStack>

        <Divider w="95%" alignSelf="center" />

        <ProfileBox
          w="100%"
          title={t("Description")}
          description={player.description || "-"}
          shouldBoldDesc={false}
          bg="rs.white"
        />

        <Divider w="95%" alignSelf="center" />

        <VStack px="4" py="4" space="2">
          <Text color="#909090" fontSize="xs">
            {t("Achievement")}
          </Text>
          {player.achievements &&
            player.achievements?.map((achievement) => {
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
          {user?.id === player.id && (
            <Pressable
              onPress={() => {
                onPressJoinClub?.();
              }}
              bg="#66CEE1"
              p="2"
            >
              <Text>{`+ ${t("Join club")}`}</Text>
            </Pressable>
          )}
        </HStack>
        <VStack mx="4">
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
        <VStack mx="4">
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
