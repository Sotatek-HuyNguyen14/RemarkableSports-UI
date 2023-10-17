import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { VStack, Text, Spinner } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import ContentCard from "../../components/Card/ContentCard";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { ContentResponse } from "../../models/responses/Content";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getAllpostContent } from "../../services/ContentServices";
import { formatCoreUrl } from "../../services/ServiceUtil";
import { getTranslation } from "../../utils/translation";
import NoRecord from "../ContentScreen/NoRecord";

export type ContentListProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ContentList"
>;

const t = getTranslation("screen.ContentList");

export default function ContentList({ navigation, route }: ContentListProps) {
  const { contents } = route.params;
  const {
    data: unexpiredList,
    error: unexpiredError,
    isValidating: unexpiredIsValidating,
    mutate: unexpiredMutate,
  } = useSWR(formatCoreUrl("/post?isExpired=false"), () =>
    getAllpostContent("?isExpired=false")
  );

  const localContenList: ContentResponse[] = [];

  // Refresh views
  contents.forEach((content) => {
    if (unexpiredList && unexpiredList?.length > 0) {
      const last = unexpiredList.find((val) => val.id === content.id);
      if (last) {
        localContenList.push(last);
      }
    }
  });

  // useFocusEffect(
  //   React.useCallback(() => {
  //     unexpiredMutate();
  //   }, [unexpiredMutate])
  // );

  return (
    <HeaderLayout
      headerProps={{
        title: t("Content list"),
        headerLabelStyle: { fontSize: 16 },
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
      isSticky
      supportPullToRefresh
      onRefresh={() => {
        unexpiredMutate();
      }}
    >
      <VStack space="4" p="defaultLayoutSpacing" flex={1}>
        {Array.isArray(localContenList) && localContenList.length > 0 ? (
          localContenList
            .sort(
              (lhs, rhs) => rhs.createdAt.valueOf() - lhs.createdAt.valueOf()
            )
            .map((val) => (
              <ContentCard
                key={val.id}
                content={val}
                onPressContentCard={(content) =>
                  navigation.navigate("ContentDetails", {
                    content,
                  })
                }
              />
            ))
        ) : (
          <NoRecord isAll />
        )}
      </VStack>
    </HeaderLayout>
  );
}
