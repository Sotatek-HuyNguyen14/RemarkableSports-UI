import React, { useCallback, useEffect, useState } from "react";
import {
  VStack,
  Image,
  Heading,
  Text,
  Box,
  Pressable,
  Modal,
  Button,
  useTheme,
  Toast,
} from "native-base";
import Hyperlink from "react-native-hyperlink";
import { useIsFocused } from "@react-navigation/native";
import { ImageSourcePropType, Linking } from "react-native";
import YoutubeIframe from "react-native-youtube-iframe";
import { formatFileUrl } from "../../services/ServiceUtil";
import { ContentResponse } from "../../models/responses/Content";
import RacketBatIcon from "../Icons/RacketBatIcon";
import { getTranslation } from "../../utils/translation";
import { formatUtcToLocalDate, FORMAT_DATE_UI_V2 } from "../../utils/date";
import { getYoutubeId } from "../../utils/strings";
import { showApiToastError } from "../ApiToastError";
import MessageToast, { MesssageToastType } from "../Toast/MessageToast";

const t = getTranslation([
  "component.ContentDetailsComponent",
  "constant.button",
]);
export interface ContentDetailsProps {
  content: ContentResponse;
  onPressLink?: () => void;
}

export function ContentDetailsComponent({
  content,
  onPressLink,
}: ContentDetailsProps) {
  const theme = useTheme();
  const videoLink = content.ytbUrl;
  const youtubeId = videoLink ? getYoutubeId(videoLink) : "";

  let imageSource: ImageSourcePropType | null | undefined = null;
  if (content.fileUrl) {
    imageSource = {
      uri: formatFileUrl(content.fileUrl),
    };
  }
  const [showImgModal, setShowImgModal] = useState(false);
  const [playing, setPlaying] = useState(false);
  const isFocusEvent = useIsFocused();
  const onStateChanged = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
    if (state === "playing") {
      setPlaying(true);
    }
    if (state === "paused") {
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!isFocusEvent) {
      setPlaying(false);
    }
  }, [isFocusEvent]);

  const imageModal = () => {
    return (
      <Modal
        avoidKeyboard
        isOpen={showImgModal}
        onClose={() => {
          setShowImgModal(false);
        }}
        size="full"
      >
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Body m="3">
            {imageSource && (
              <Image
                resizeMode="cover"
                resizeMethod="resize"
                borderRadius="xl"
                w="100%"
                height={250}
                alt="Venue Image"
                source={imageSource}
                alignSelf="center"
              />
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  };

  return (
    <VStack flex={1} pt="defaultLayoutSpacing">
      <VStack space="4">
        {youtubeId && (
          <Box bg="transparent">
            <YoutubeIframe
              height={240}
              width="100%"
              play={playing}
              videoId={youtubeId}
              onChangeState={onStateChanged}
            />
          </Box>
        )}
        {!youtubeId && imageSource && (
          <Pressable
            onPress={() => {
              if (!youtubeId) setShowImgModal(true);
            }}
            px="defaultLayoutSpacing"
          >
            <Image
              borderRadius="xl"
              w="100%"
              height={250}
              alt="Venue Image"
              source={imageSource}
              alignSelf="center"
            />
          </Pressable>
        )}
        {!youtubeId && !imageSource && (
          <Box
            w="91.47%"
            height={210}
            bg="rs_secondary.purple"
            borderRadius="xl"
            p="4"
            alignSelf="center"
            justifyContent="space-between"
            alignItems="flex-end"
          >
            <RacketBatIcon color="white" />
          </Box>
        )}
        {/* info */}
        {content.content && (
          <VStack px="5" space={3}>
            <Heading numberOfLines={3} fontSize={16}>
              {content.title}
            </Heading>
            <Hyperlink
              linkStyle={{ color: theme.colors.rs.skyBlue }}
              onPress={(url, text) => {
                if (url) {
                  try {
                    Linking.openURL(url).catch((error) => {
                      Toast.show({
                        id: "content_open_linking",
                        duration: 2000,
                        placement: "top",
                        render: () => {
                          return (
                            <MessageToast
                              type={MesssageToastType.Error}
                              title={t(
                                "You can not open, please download the corresponding application"
                              )}
                            />
                          );
                        },
                      });
                    });
                  } catch (error) {
                    showApiToastError(error);
                  }
                }
              }}
            >
              <Text>{content.content}</Text>
            </Hyperlink>
            <Text color="rs_secondary.grey">
              {formatUtcToLocalDate(content.createdAt)}
            </Text>
            <Heading fontSize={16}>
              {content?.views ?? 0} {t("Views")}
            </Heading>
          </VStack>
        )}
      </VStack>
      {content.resourceId && content.linkage && (
        <Button
          mx="4"
          mt="auto"
          variant="outline"
          onPress={() => {
            onPressLink?.();
          }}
        >
          {t("View Event Detail")}
        </Button>
      )}
      {imageModal()}
    </VStack>
  );
}
