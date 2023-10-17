import { NativeStackScreenProps } from "@react-navigation/native-stack";
import useSWR from "swr";
import { Text, Pressable, Box, Button, HStack } from "native-base";
import React from "react";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import { formatCoreUrl } from "../../../services/ServiceUtil";
import { getTranslation } from "../../../utils/translation";
import { getAllClubs } from "../../../services/ClubServices";
import { ClubResponse } from "../../../models/responses/Club";
import ClubDetails from "../../../components/Club/ClubDetails";
import { ClubStatusType } from "../../../models/requests/Club";

const t = getTranslation([
  "constant.district",
  "screen.AdminScreens.AdminClub",
]);

export default function AdminClub({
  navigation,
}: NativeStackScreenProps<MainStackNavigatorParamList, "AdminNavigator">) {
  const { data, mutate, isValidating } = useSWR<ClubResponse[]>(
    formatCoreUrl("/club"),
    getAllClubs
  );
  const result = data?.filter(
    (val) => val.approvalStatus === ClubStatusType.Pending
  );

  return (
    <HeaderLayout
      headerProps={{
        hasBackButton: false,
        title: t("Club Request"),
        headerLabelContainerStyle: {
          alignItems: "flex-start",
        },
        rightComponent: (
          <HStack>
            <Button
              size="xs"
              borderRadius={10}
              variant="outline"
              isLoading={isValidating}
              onPress={async () => {
                await mutate();
              }}
            >
              {t("Refresh")}
            </Button>
          </HStack>
        ),
      }}
      isSticky
    >
      {result && Array.isArray(result) && result.length ? (
        result?.map((value) => {
          return (
            <Box
              bgColor="blueGray.100"
              shadow="6"
              borderRadius="10"
              m="4"
              key={value.id}
            >
              <Pressable
                onPress={() => {
                  navigation.navigate("AdminClubApproval", {
                    clubResponse: value,
                  });
                }}
                _pressed={{ bgColor: "rs.lightBlue" }}
                _focus={{ bgColor: "rs.lightBlue" }}
              >
                <ClubDetails club={value} />
              </Pressable>
            </Box>
          );
        })
      ) : (
        <Text p="defaultLayoutSpacing">
          {t("No pending onboarding requests")}
        </Text>
      )}
    </HeaderLayout>
  );
}
