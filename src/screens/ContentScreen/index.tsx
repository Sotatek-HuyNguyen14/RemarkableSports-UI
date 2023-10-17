import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Button,
  Center,
  Heading,
  HStack,
  Toast,
  Text,
  VStack,
} from "native-base";
import { LayoutAnimation } from "react-native";
import useSWR from "swr";
import { useFocusEffect } from "@react-navigation/native";
import { MainStackNavigatorParamList } from "../../routers/Types";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import { getTranslation } from "../../utils/translation";
import GhostTabbar from "../../components/GhostTabBar";
import BannerButton from "../../components/BannerButton";
import ContentCard from "../../components/Card/ContentCard";
import NoRecord from "./NoRecord";
import { ContentResponse } from "../../models/responses/Content";
import { useAuth } from "../../hooks/UseAuth";
import { formatCoreUrl } from "../../services/ServiceUtil";
import {
  getAllpostContent,
  getPostContentById,
  getPostPermissionById,
} from "../../services/ContentServices";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { getEventById } from "../../services/EventServices";
import { showApiToastError } from "../../components/ApiToastError";

export type ContentScreenProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ContentScreen"
>;
enum ActiveTab {
  Created = "Created",
  Expired = "Expired",
}
const t = getTranslation("screen.ContentScreen");
export default function ContentScreen({ navigation }: ContentScreenProps) {
  const { user } = useAuth();
  const {
    data: unexpiredList,
    error: unexpiredError,
    isValidating: unexpiredIsValidating,
    mutate: unexpiredMutate,
  } = useSWR(formatCoreUrl("/post?isExpired=false"), () =>
    getAllpostContent("?isExpired=false")
  );
  const {
    data: allExpiredList,
    error: expiredError,
    isValidating: expiredIsValidating,
    mutate: expiredMutate,
  } = useSWR(formatCoreUrl("/post?isExpired=true"), () =>
    getAllpostContent("?isExpired=true")
  );
  const { data: permission, mutate: postPermissiontMutate } = useSWR(
    user?.sub ? formatCoreUrl(`/post-permission/${user?.sub}`) : null,
    () => (user?.sub ? getPostPermissionById(user?.sub) : null)
  );
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [createdList, setCreatedList] = useState<ContentResponse[]>([]);
  const [expiredList, setExpiredList] = useState<ContentResponse[]>([]);
  const [otherList, setOtherList] = useState<ContentResponse[]>([]);
  const availableTabs = [
    `${t(ActiveTab.Created)}(${createdList?.length ?? 0})`,
  ];

  useEffect(() => {
    if (Array.isArray(allExpiredList) && allExpiredList?.length) {
      const myExpired = allExpiredList.filter(
        (val) => val.creatorId === user?.sub
      );
      if (myExpired) {
        setExpiredList([...myExpired]);
      } else {
        setExpiredList([]);
      }
    } else {
      setExpiredList([]);
    }
  }, [allExpiredList, user?.id, user?.sub]);

  useEffect(() => {
    if (Array.isArray(unexpiredList) && unexpiredList?.length) {
      const myselfs = unexpiredList.filter(
        (val) => val.creatorId === user?.sub
      );
      const others = unexpiredList.filter((val) => val.creatorId !== user?.sub);
      if (myselfs) {
        setCreatedList([...myselfs]);
      } else {
        setCreatedList([]);
      }
      if (others) {
        setOtherList([...others]);
      } else {
        setOtherList([]);
      }
    } else {
      setCreatedList([]);
      setOtherList([]);
    }
  }, [unexpiredList, user?.id, user?.sub]);

  useFocusEffect(
    React.useCallback(() => {
      unexpiredMutate();
      expiredMutate();
      postPermissiontMutate();
    }, [unexpiredMutate, expiredMutate, postPermissiontMutate])
  );

  const onNavigationTo = (content: ContentResponse) => {
    navigation.navigate("ContentDetails", {
      content,
    });
  };

  return (
    <HeaderLayout
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Content"),
        headerLabelStyle: {
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 6,
        },
        hasBackButton: false,
        headerLabelContainerStyle: {
          alignItems: "center",
          justifyContent: "center",
        },
      }}
      isSticky
    >
      {permission?.canPost && (
        <>
          <BannerButton
            headerLabel={t("Create Content")}
            description={t(
              "Create a new content to encourage player to join your activity"
            )}
            onPress={() => {
              navigation.navigate("AddContent");
            }}
          />
          <VStack mx="4" space={4} my="4">
            <GhostTabbar
              items={availableTabs}
              activateColor="rs.primary_purple"
              onPress={(item: string, index: number) => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                setActiveTabIndex(index);
              }}
              defaultIndex={activeTabIndex}
            />
            {activeTabIndex === 0 &&
              !unexpiredError &&
              !unexpiredIsValidating &&
              (createdList.length ? (
                <VStack space={4}>
                  {createdList
                    .sort(
                      (lhs, rhs) =>
                        rhs.createdAt.valueOf() - lhs.createdAt.valueOf()
                    )
                    .map((val) => (
                      <ContentCard
                        key={val.id}
                        content={val}
                        onPressContentCard={(content) => {
                          onNavigationTo(content);
                        }}
                      />
                    ))}
                </VStack>
              ) : (
                <NoRecord />
              ))}
            {activeTabIndex === 1 &&
              !expiredError &&
              !expiredIsValidating &&
              (expiredList?.length ? (
                <VStack space={4}>
                  {expiredList
                    .sort(
                      (lhs, rhs) =>
                        rhs.createdAt.valueOf() - lhs.createdAt.valueOf()
                    )
                    .map((val) => (
                      <ContentCard
                        key={val.id}
                        content={val}
                        onPressContentCard={(content) => {
                          onNavigationTo(content);
                        }}
                      />
                    ))}
                </VStack>
              ) : (
                <NoRecord />
              ))}
            <HStack alignItems="center" justifyContent="space-between">
              <Heading>{t("Other content")}</Heading>
              <Button
                size="sm"
                variant="link"
                onPress={() => {
                  navigation.navigate("ContentList", {
                    contents: otherList?.length ? otherList : [],
                  });
                }}
              >
                <Text color="rs.primary_purple" fontSize={16}>
                  {t("View all")}
                </Text>
              </Button>
            </HStack>
            {!unexpiredError &&
              !unexpiredIsValidating &&
              (otherList?.length ? (
                <VStack space={4}>
                  {otherList
                    .sort(
                      (lhs, rhs) =>
                        rhs.createdAt.valueOf() - lhs.createdAt.valueOf()
                    )
                    .filter((item, index) => index < 3)
                    .map((val) => (
                      <ContentCard
                        key={val.id}
                        content={val}
                        onPressContentCard={(content) => {
                          onNavigationTo(content);
                        }}
                      />
                    ))}
                </VStack>
              ) : (
                <NoRecord />
              ))}
          </VStack>
        </>
      )}
      {!permission?.canPost &&
        !unexpiredError &&
        !unexpiredIsValidating &&
        (otherList?.length ? (
          <VStack space={4} p="defaultLayoutSpacing" flex={1}>
            {otherList
              .sort(
                (lhs, rhs) => rhs.createdAt.valueOf() - lhs.createdAt.valueOf()
              )
              .map((val) => (
                <ContentCard
                  key={val.id}
                  content={val}
                  onPressContentCard={(content) => {
                    onNavigationTo(content);
                  }}
                />
              ))}
          </VStack>
        ) : (
          <Center flex={1}>
            <NoRecord isAll />
          </Center>
        ))}
      {(unexpiredIsValidating || expiredIsValidating) && (
        <Center flex={1}>
          <Loading />
        </Center>
      )}
      {((!unexpiredIsValidating && unexpiredError) ||
        (!expiredIsValidating && expiredError)) && (
        <Center flex={1}>
          <ErrorMessage />
        </Center>
      )}
    </HeaderLayout>
  );
}
