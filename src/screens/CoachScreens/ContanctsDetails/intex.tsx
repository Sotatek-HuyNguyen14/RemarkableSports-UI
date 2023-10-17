import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Box, Button, Heading, useTheme, VStack } from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { getTranslation } from "../../../utils/translation";

import PlayerShortProfile from "../../../components/PlayerShortProfile";

import { formatName, getUserName } from "../../../utils/name";
import RecordCrad from "../../../components/Card/RecordCrad";
import {
  ContactResponse,
  OneOnOneStatus,
} from "../../../models/responses/O3Response";
import { queryContactById } from "../../../services/O3Services";
import { showApiToastError } from "../../../components/ApiToastError";

export type ContanctsDetailsProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "CoachContanctsDetails"
>;

const t = getTranslation([
  "screen.CoachScreens.ContanctsDetails",
  "constant.button",
]);
export default function ContanctsDetails({
  navigation,
  route,
}: ContanctsDetailsProps) {
  const { space } = useTheme();
  const { contanct } = route.params;
  const [localContanct, setLocalContanct] = useState<ContactResponse>(contanct);

  useFocusEffect(
    useCallback(() => {
      queryContactById(contanct.playerId)
        .then((player) => {
          setLocalContanct(player);
        })
        .catch((e) => {
          showApiToastError(e);
        });
    }, [contanct.playerId])
  );

  const contactTimes =
    localContanct &&
    localContanct.oneOnOneCoachs &&
    localContanct.oneOnOneCoachs.length > 0
      ? localContanct.oneOnOneCoachs
          ?.filter(
            (val) =>
              val.status === OneOnOneStatus.Completed ||
              val.status === OneOnOneStatus.Matched
          )
          .length.toString()
      : "0";

  return (
    <HeaderLayout
      isSticky
      headerProps={{
        title: `${t("Meetup with")} ${getUserName(localContanct.playerInfo)} `,
        containerStyle: { marginHorizontal: 0 },
      }}
      containerProps={{
        marginHorizontal: space.defaultLayoutSpacing,
      }}
    >
      <VStack space={4} flex={1} p="defaultLayoutSpacing">
        <PlayerShortProfile
          player={localContanct.playerInfo}
          times={contactTimes}
        />
        <Heading>{t("Meetup Record")}</Heading>

        {localContanct &&
          localContanct.oneOnOneCoachs &&
          localContanct.oneOnOneCoachs.length > 0 &&
          localContanct.oneOnOneCoachs
            .sort((a, b) => b.fromTime.valueOf() - a.fromTime.valueOf())
            .map((val) => (
              <RecordCrad
                oneOnOneCoach={val}
                onPress={() => {
                  // if (val.status === OneOnOneStatus.Matched) {
                  //   navigation.navigate("CoachO3ApplyRequest", {
                  //     o3Id: val.id,
                  //   });
                  // } else {
                  navigation.navigate("CoachO3Details", {
                    o3Id: val.id,
                  });
                  // }
                }}
              />
            ))}
      </VStack>
    </HeaderLayout>
  );
}
