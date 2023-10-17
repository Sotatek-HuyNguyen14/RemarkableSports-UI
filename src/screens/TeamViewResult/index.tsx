import {
  VStack,
  IconButton,
  HStack,
  Pressable,
  Text,
  Heading,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Table, Row, Cell, TableWrapper } from "react-native-table-component";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import ResultItem from "../OrganizerScreens/ManageDivision/ResultItem";

export type TeamViewResultScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "TeamViewResult"
>;

const t = getTranslation("screen.TeamViewResult");

function TeamViewResultScreen({
  navigation,
  route,
}: TeamViewResultScreenProps) {
  const boardView = () => {
    const headers = ["Player", "P", "W", "%"];
    const rowsData = [
      ["1", "2", "3", "4"],
      ["a", "b", "c", "d"],
      ["1", "2", "3", "4"],
      ["a", "b", "c", "d"],
    ];

    const element = (data, index) => {
      return (
        <HStack space="2" p="2">
          <Text>1</Text>
          <Pressable onPress={() => {}}>
            <Text
              fontWeight="medium"
              textDecorationLine="underline"
              color="rs.primary_purple"
            >
              Name
            </Text>
          </Pressable>
        </HStack>
      );
    };

    return (
      <Table borderStyle={{}}>
        <Row
          flexArr={[1, 1 / 4, 1 / 4, 1 / 4]}
          data={headers}
          style={{ padding: 8 }}
          textStyle={{ fontWeight: "bold", fontSize: 16 }}
        />
        {rowsData.map((rowData, index) => (
          <TableWrapper
            style={{
              flexDirection: "row",
              padding: 4,
              backgroundColor: index % 2 === 0 ? "#D3D3D3" : "#ECECEC",
            }}
            key={`wrapper_${rowData}`}
          >
            {rowData.map((cellData, cellIndex) => (
              <Cell
                style={{
                  flex: cellIndex === 0 ? 1 : 1 / 4,
                }}
                textStyle={{ fontWeight: "bold" }}
                key={`cell_${cellData}`}
                data={cellIndex === 0 ? element(cellData, index) : cellData}
              />
            ))}
          </TableWrapper>
        ))}
      </Table>
    );
  };

  const teamResultView = () => {
    const results = [];
    if (!results || results.length === 0) {
      return (
        <HStack mt="4">
          <Text>{t("No result")}</Text>
        </HStack>
      );
    }

    return (
      <VStack space="4">
        {results &&
          results.map((result) => {
            return <TeamViewResultScreen />;
          })}
      </VStack>
    );
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: "Team name",
      }}
      isSticky
    >
      <VStack mt="4">{boardView()}</VStack>
      <VStack mt="4" mx="defaultLayoutSpacing">
        <Heading alignSelf="center" fontSize="md">
          {t("Team Results Table")}
        </Heading>
        {teamResultView()}
      </VStack>
    </HeaderLayout>
  );
}

export default TeamViewResultScreen;
