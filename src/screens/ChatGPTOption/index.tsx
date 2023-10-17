/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Linking } from "react-native";
import { HStack, Pressable, Text, VStack, Toast } from "native-base";
import { RouteProp } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import Lottie from "lottie-react-native";
import { uniqueId } from "lodash";
import { MainStackNavigatorParamList } from "../../routers/Types";
import { getTranslation } from "../../utils/translation";
import { useAuth } from "../../hooks/UseAuth";
import { UserType } from "../../models/User";
import HeaderLayout from "../../components/Layout/HeaderLayout";
import DownArrowIcon from "../../components/Icons/DownArrowIcon";
import SingleSelectModal from "../../components/Modal/SingleSelectModal";
import { formatUtcToLocalDate } from "../../utils/date";
import ChatCornerLeftIcon from "../../components/Icons/ChatCornerLeftIcon";
import ChatCornerRightIcon from "../../components/Icons/ChatCornerRightIcon";
import SendIcon from "../../components/Icons/SendIcon";
import ChatInput from "./ChatInput";
import BoardIcon from "../../components/Icons/BoardIcon";
import FlagIcon from "../../components/Icons/FlagIcon";
import MapIcon from "../../components/Icons/EventIcon";
import RoundedPlayIcon from "../../components/Icons/RoundedPlayIcon";
import {
  ChatGPTTopic,
  CHAT_GPT_TOPICS_OPTIONS,
} from "../../models/responses/ChatGPT";
import {
  getChatMonthlyUsage,
  getDailyQuestionCount,
  GO_PING_PONG_URL_CHANNEL,
  MAX_NUMBER_OF_CHATS_PER_DAY,
  sendChat,
} from "../../services/ChatGPTServices";
import { showApiToastError } from "../../components/ApiToastError";
import { isBlank } from "../../utils/strings";
import { formatCoreUrl } from "../../services/ServiceUtil";
import ImageDirectory from "../../assets";
import MessageToast, {
  MesssageToastType,
} from "../../components/Toast/MessageToast";
import { FunctionalButtonModel } from "../../components/v2/FunctionalButtons";

export type ChatGPTWithSelectedTopicPropsNavigationProp =
  NativeStackNavigationProp<
    MainStackNavigatorParamList,
    "ChatGPTWithSelectedTopic"
  >;

type ChatGPTWithSelectedTopicPropsBaseProps = RouteProp<
  MainStackNavigatorParamList,
  "ChatGPTWithSelectedTopic"
>;

export interface ChatGPTWithSelectedTopicProps
  extends ChatGPTWithSelectedTopicPropsBaseProps {
  route: ChatGPTWithSelectedTopicPropsBaseProps;
  navigation: ChatGPTWithSelectedTopicPropsNavigationProp;
}
const t = getTranslation([
  "screen.ChatGPTWithSelectedTopic",
  "screen.ChatGPT",
  "constant.ChatGPT",
  "screen.PlayerScreens.Home",
  "component.PlayerMeetupButton",
  "constant.eventType",
  "constant.button",
  "formInput",
  "toastMessage",
]);

interface FormValue {
  selectedTopicValue: ChatGPTTopic;
  chatText?: string;
}

interface ChatHistory {
  content: string;
  isFromUser: boolean;
}

export default function ChatGPTWithSelectedTopic({
  navigation,
  route,
}: ChatGPTWithSelectedTopicProps) {
  const { topic } = route.params;
  const options = CHAT_GPT_TOPICS_OPTIONS.map((val) => {
    return { label: t(val.label), value: val.value };
  });

  const { control, watch, setValue } = useForm<FormValue>({
    defaultValues: {
      selectedTopicValue: topic || options[0],
    },
  });
  const typingIcon = ImageDirectory.TYPONG_GIF;
  let thisTimer: NodeJS.Timeout | null = null;
  const chatText = watch("chatText");
  const selectedTopicValue = watch("selectedTopicValue");
  const selectedTopic =
    options.filter((filterTopic) => {
      return filterTopic.value === selectedTopicValue;
    })[0] || options[0];
  const [optionModal, setOptionModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    {
      topic: ChatGPTTopic;
      messages: ChatHistory[];
    }[]
  >([
    {
      topic: ChatGPTTopic.Backhand,
      messages: [],
    },
    {
      topic: ChatGPTTopic.Footwork,
      messages: [],
    },
    {
      topic: ChatGPTTopic.Forehand,
      messages: [],
    },
    {
      topic: ChatGPTTopic.Receive,
      messages: [],
    },
    {
      topic: ChatGPTTopic.Rules,
      messages: [],
    },
    {
      topic: ChatGPTTopic.Serve,
      messages: [],
    },
    {
      topic: ChatGPTTopic.Spin,
      messages: [],
    },
  ]);

  const { user } = useAuth();
  const userId = user?.id;
  const {
    data: dailyQuestionCount,
    mutate: dailyQuestionCountMutate,
    isValidating: isDailyQuestionCountValidating,
    error: dailyQuestionCountError,
  } = useSWR(formatCoreUrl(`/chat/quota/${userId}`), () => {
    if (userId) {
      return getDailyQuestionCount(userId);
    }
  });

  const {
    data: monthUsage,
    mutate: monthlyUsageMutate,
    isValidating: isMonthUsageValidating,
    error: monthUsageError,
  } = useSWR(formatCoreUrl("/chat/monthly-usage"), () => {
    return getChatMonthlyUsage();
  });

  const optionSelection = () => {
    return (
      <Pressable
        onPress={() => {
          setOptionModalOpen(true);
        }}
      >
        <HStack
          p="2"
          bg="#66CEE11A"
          space="4"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="md" fontWeight="bold">
            {selectedTopic.label}
          </Text>
          <DownArrowIcon />
        </HStack>
      </Pressable>
    );
  };

  useEffect(() => {
    return () => {
      if (thisTimer) clearTimeout(thisTimer);
    };
  }, [thisTimer]);

  const chatCell = (
    content: string,
    date: Date,
    isFromUser = true,
    background = "",
    marginLeftChatBox = -8
  ) => {
    const alignView = isFromUser ? "flex-end" : "flex-start";
    const bg = !isBlank(background)
      ? background
      : isFromUser
      ? "rs.primary_purple"
      : "#F2F2F7";
    const textColor = isFromUser ? "rs.white" : "#2C2C2E";

    const smallLeftComponent = isFromUser ? null : (
      <ChatCornerLeftIcon fillColor={bg} size="md" />
    );
    const smallLeftTyping = isFromUser ? null : (
      <HStack>
        <ChatCornerLeftIcon fillColor="#F2F2F7" mr="-1" size="sm" />
        <Lottie
          source={typingIcon}
          style={{
            width: 37,
            height: 37,
            backgroundColor: "#F2F2F7",
            borderBottomRightRadius: 8,
            borderBottomLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
          autoPlay
          loop
        />
      </HStack>
    );

    const smallRightComponent = isFromUser ? <ChatCornerRightIcon /> : null;

    return (
      <HStack mt="2" alignSelf={alignView}>
        {!isFromUser &&
          isLoading &&
          isBlank(background) &&
          isBlank(content) &&
          smallLeftTyping}
        {!isBlank(content) && (
          <>
            {smallLeftComponent}
            <VStack
              style={{ marginLeft: marginLeftChatBox, marginRight: -10 }}
              py="2"
              px="4"
              maxWidth="90%"
              bg={bg}
              alignSelf={alignView}
              borderRadius="lg"
              borderTopRightRadius={isFromUser ? "0" : "lg"}
              borderTopLeftRadius={!isFromUser ? "0" : "lg"}
            >
              <Text fontSize="md" color={textColor}>
                {content}
              </Text>
            </VStack>
          </>
        )}
        {smallRightComponent}
      </HStack>
    );
  };

  const chatGroupedByDate = () => {
    const currentChat = chatHistory.filter(
      (chat) => chat.topic === selectedTopicValue
    )[0];
    if (currentChat && currentChat.messages.length > 0)
      return (
        <VStack alignItems="center" my="3">
          <Text color="#666668" mb="2">
            {formatUtcToLocalDate(new Date())}
          </Text>
          {/* Messages */}
          <VStack space="1" w="100%">
            {currentChat.messages.map((chat) => {
              return chatCell(chat.content, new Date(), chat.isFromUser);
            })}
          </VStack>
        </VStack>
      );
  };

  const chatContent = () => {
    return [1].map((value, index) => {
      return chatGroupedByDate();
    });
  };

  const chatBar = () => {
    return (
      <HStack
        p="4"
        mt="4"
        borderTopWidth="1"
        borderTopColor="#E5E5EA"
        space="2"
        w="100%"
        alignItems="center"
      >
        <ChatInput
          placeholder={t("Start typing")}
          inputProps={{
            borderColor: "rs.white",
          }}
          containerProps={{
            style: {
              backgroundColor: "gray.100",
              flex: 1,
            },
          }}
          controllerProps={{ control, name: "chatText" }}
        />
        <Pressable
          onPress={async () => {
            if (chatText && !isBlank(chatText)) {
              setLoading(true);
              setChatHistory(
                chatHistory.map((history) => {
                  if (history.topic === selectedTopicValue) {
                    // eslint-disable-next-line no-param-reassign
                    history.messages = [
                      ...history.messages,
                      { content: chatText, isFromUser: true },
                    ];
                  }
                  return history;
                })
              );
              try {
                setValue("chatText", "");
                const message = chatText;
                // if get api over 30s show Toast
                thisTimer = setTimeout(() => {
                  if (isLoading) {
                    Toast.show({
                      id: uniqueId,
                      placement: "top",
                      duration: 2000,
                      render: () => {
                        return (
                          <MessageToast
                            type={MesssageToastType.Error}
                            title={`${t("Loading")}...`}
                            body={t(
                              "Something usual has happened and it takes longer than expected to load Please enter the question again"
                            )}
                          />
                        );
                      },
                    });
                    setLoading(false);
                  }
                }, 30000);
                const res = await sendChat({
                  payload: message,
                  chatHistory:
                    chatHistory
                      .filter((chat) => chat.topic === selectedTopicValue)?.[0]
                      .messages?.map((text) => text.content) || [],
                  category: selectedTopicValue,
                });
                // Res.content will store the response from ChatGPT
                setChatHistory(
                  chatHistory.map((history) => {
                    if (history.topic === selectedTopicValue) {
                      // eslint-disable-next-line no-param-reassign
                      history.messages = [
                        ...history.messages,
                        { content: res.content, isFromUser: false },
                      ];
                    }
                    return history;
                  })
                );
                setLoading(false);
                dailyQuestionCountMutate();
                monthlyUsageMutate();
              } catch (error) {
                setLoading(false);
                showApiToastError(error);
              }
            }
          }}
        >
          <SendIcon />
        </Pressable>
      </HStack>
    );
  };

  const isDailyQuestionCountAvailable =
    dailyQuestionCount &&
    dailyQuestionCount.dailyQuestionCount < MAX_NUMBER_OF_CHATS_PER_DAY;
  const isMonthlyUsageAvailable =
    monthUsage && monthUsage.isExceedLimit === false;
  const isAbleToChat = isDailyQuestionCountAvailable && isMonthlyUsageAvailable;

  const bottomSheetItem = (button: FunctionalButtonModel) => {
    return (
      <Pressable
        onPress={() => {
          button.onPress();
        }}
        key={`${button.description}_${button.title}`}
        m="2"
        bg="#F6F6F6"
        borderRadius="xl"
        p="4"
      >
        <HStack space="2">
          <HStack
            justifyContent="center"
            alignItems="center"
            w="10"
            h="10"
            borderRadius="full"
            bg="rs.primary_purple"
          >
            {button.icon()}
          </HStack>
          <VStack>
            <Text fontWeight="bold" fontSize="md">
              {button.title}
            </Text>
            <Text>{button.description}</Text>
          </VStack>
        </HStack>
      </Pressable>
    );
  };

  const bottomSheetAction = () => {
    const ftBtns: FunctionalButtonModel[] = [
      {
        title: t("Coach"),
        description: t("Look for coach now"),
        icon: () => {
          return <BoardIcon fillColor="white" size="md" />;
        },
        onPress: () => {
          switch (user?.userType) {
            case UserType.Player:
              navigation.navigate("PlayerO3AppliedCoach");
              break;
            case UserType.Coach:
              navigation.navigate("CoachRequestList");
              break;
            default:
              break;
          }
        },
      },
      {
        title: t("Course"),
        description: t("Check for availability now"),
        icon: () => {
          return <FlagIcon fillColor="white" size="md" />;
        },
        onPress: () => {
          switch (user?.userType) {
            case UserType.Player:
              navigation.navigate("PlayerCourseList");
              break;
            case UserType.Coach:
              navigation.navigate("CoachCourseList");
              break;
            case UserType.ClubStaff:
              navigation.navigate("ClubCourseList");
              break;
            default:
              break;
          }
        },
      },
      {
        title: t("Event"),
        description: t("Apply to an event now"),
        icon: () => {
          return <MapIcon size="md" fillColor="white" />;
        },
        onPress: () => {
          navigation.navigate("EventList");
        },
      },
    ];

    return (
      <VStack mx="defaultLayoutSpacing">
        {ftBtns
          .filter((button) => {
            if (user?.userType === UserType.ClubStaff) {
              // Current user is club staff then remove the Meetup Coach button
              return button.title !== t("Coach");
            }
            return true;
          })
          .map((button) => {
            return bottomSheetItem(button);
          })}
        {/* Youtube button */}
        <Pressable
          onPress={() => {
            Linking.openURL(GO_PING_PONG_URL_CHANNEL);
          }}
          m="2"
          bg="rs.primary_purple"
          borderRadius="xl"
          p="4"
        >
          <HStack space="2">
            <HStack
              justifyContent="center"
              alignItems="center"
              w="10"
              h="10"
              borderRadius="full"
              bg="rs.primary_purple"
            >
              <RoundedPlayIcon size="3xl" />
            </HStack>
            <VStack>
              <Text fontWeight="bold" fontSize="md" color="rs.white">
                {t("Youtube")}
              </Text>
              <Text color="rs.white">{t("Watch our latest video now")}</Text>
            </VStack>
          </HStack>
        </Pressable>
      </VStack>
    );
  };

  return (
    <HeaderLayout
      headerProps={{
        title: t("ChatPingPong"),
        containerStyle: { marginHorizontal: 0 },
      }}
      isSticky
    >
      <VStack flex="1" mt="3">
        {optionSelection()}
        <VStack flex="1" mx="defaultLayoutSpacing">
          {chatContent()}
          {isLoading && chatCell("", new Date(), false, "", -4)}
          {!isAbleToChat &&
            !isDailyQuestionCountValidating &&
            !isMonthUsageValidating &&
            chatCell(
              t("You have reached the maximum limit with ChatPingPong"),
              new Date(),
              false,
              "#66CEE133",
              -4
            )}
        </VStack>
        {!isDailyQuestionCountValidating &&
          !isMonthUsageValidating &&
          (isAbleToChat ? chatBar() : bottomSheetAction())}

        <SingleSelectModal
          title={`${t("Select")}${t("Topic")}`}
          options={options}
          controllerProps={{
            name: "selectedTopicValue",
            control,
            rules: {
              required: true,
            },
          }}
          isOpen={optionModal}
          onClose={() => {
            setOptionModalOpen(false);
          }}
          confirmButtonText={t("Confirm")}
        />
      </VStack>
    </HeaderLayout>
  );
}
