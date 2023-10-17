import React from "react";
import { Avatar, Heading, VStack, Text, HStack, Divider } from "native-base";
import { ClubStaff } from "../../models/User";
import { formatFileUrl } from "../../services/ServiceUtil";
import { getTranslation } from "../../utils/translation";
import formatPhone from "../../utils/phone";
import { getUserName } from "../../utils/name";
import { ProfileBox } from "../Coach/CoachProfile";

const t = getTranslation([
  "component.ClubStaff.ClubStaffProfileViewer",
  "component.ClubShortProfile",
  "constant.district",
  "constant.profile",
]);

export interface ClubStaffProfileViewerProps {
  clubStaff: ClubStaff;
}

export default function ClubStaffProfileViewer({
  clubStaff,
}: ClubStaffProfileViewerProps) {
  return (
    <VStack flex="1" space={6} mx="defaultLayoutSpacing">
      {/* Top general info */}
      <VStack space="3">
        {/* Avatar */}
        <Avatar
          size="lg"
          alignSelf="center"
          source={
            clubStaff.profilePicture
              ? { uri: formatFileUrl(clubStaff.profilePicture) }
              : undefined
          }
        >
          {clubStaff.firstName}
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
            <Text>{clubStaff.sex.charAt(0).toUpperCase()}</Text>
          </HStack>
          <Heading fontSize="md">{getUserName(clubStaff)}</Heading>
        </HStack>
        <Divider />
        <ProfileBox
          bg="rs.white"
          title={t("Phone Number")}
          description={clubStaff.mobile ? formatPhone(clubStaff.mobile) : "-"}
          shouldBoldDesc={false}
        />
        <Divider />
      </VStack>
    </VStack>
  );
}
