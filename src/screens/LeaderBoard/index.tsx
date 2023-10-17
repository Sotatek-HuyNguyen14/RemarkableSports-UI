import {
  VStack,
  IconButton,
  Pressable,
  Heading,
  HStack,
  Text,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Table, Row, TableWrapper, Cell } from "react-native-table-component";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import { MainStackNavigatorParamList } from "../../routers/Types";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import OneColumnPickerModal from "../../components/Modal/OneColumnPickerModal";
import { DivisionModel } from "../../models/responses/League";

export type LeaderBoardScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "LeaderBoard"
>;

const t = getTranslation("screen.LeaderBoard");

interface FormValue {
  division?: DivisionModel;
}

function LeaderBoardScreen({ navigation, route }: LeaderBoardScreenProps) {
  const [divisionSelection, setShowDivisionSelection] = useState(false);

  const { league } = route.params;
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    setValue,
    resetField,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: {
      division:
        league.divisions && league.divisions.length > 0
          ? league.divisions[0]
          : null,
    },
  });

  const division = watch("division");
  const divisionOptions = league.divisions.map((d) => {
    return {
      label: d.name,
      value: d,
    };
  });
  const boardView = () => {
    const headers = ["# Team", "P", "W", "D", "L", "Pts"];
    const rowsData = [
      ["Team", 5, 4, 2, 1, 9],
      ["Team", 5, 4, 2, 1, 9],
      ["Team", 5, 4, 2, 1, 9],
      ["Team", 5, 4, 2, 1, 9],
    ];

    const element = (teamName: string, index: number) => {
      const rank = index + 1;
      const rankBg =
        rank === 1
          ? "rs.GPP_lightBlue"
          : rank === 2
          ? "#B3B6B8"
          : rank === 3
          ? "#F2B284"
          : null;
      return (
        <HStack space="2" p="2">
          <HStack
            w="6"
            h="6"
            borderRadius="full"
            bg={rankBg}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize="xs" color="black">
              {rank}
            </Text>
          </HStack>
          <Pressable
            onPress={() => {
              navigation.navigate("TeamViewResult");
            }}
          >
            <Text
              fontWeight="medium"
              textDecorationLine="underline"
              color="rs.primary_purple"
            >
              {teamName}
            </Text>
          </Pressable>
        </HStack>
      );
    };

    return (
      <Table borderStyle={{}}>
        <Row
          flexArr={[1, 1 / 4, 1 / 4, 1 / 4, 1 / 4, 1 / 4]}
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

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("LeaderBoard"),
      }}
      isSticky
    >
      <VStack mx="defaultLayoutSpacing">
        <Pressable
          onPress={() => {
            setShowDivisionSelection(true);
          }}
        >
          <HStack
            justifyContent="space-between"
            bg="gray.200"
            p="4"
            borderRadius="2xl"
          >
            {division ? (
              <VStack space="1">
                <Text color="gray.700">{division.name}</Text>
              </VStack>
            ) : (
              <Text color="gray.700">{t("Please select a division")}</Text>
            )}
            <DownArrowIcon size="sm" />
          </HStack>
        </Pressable>
      </VStack>
      <VStack mt="4">{boardView()}</VStack>
      {division && (
        <OneColumnPickerModal
          isOpen={divisionSelection}
          onClose={() => setShowDivisionSelection(false)}
          headerLabel={t("Select Division")}
          options={divisionOptions}
          controllerProps={{
            name: "division",
            control,
          }}
        />
      )}
    </HeaderLayout>
  );
}

export default LeaderBoardScreen;
