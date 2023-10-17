import React from "react";
import { HStack, VStack, Text, Pressable, Image, Box } from "native-base";
import Card from "./Card";

import { ContentResponse } from "../../models/responses/Content";
import { formatFileUrl } from "../../services/ServiceUtil";
import RacketBatIcon from "../Icons/RacketBatIcon";
import { formatUtcToLocalDate } from "../../utils/date";

export default function ContentCard({
  content,
  onPressContentCard,
}: {
  content: ContentResponse;
  onPressContentCard?: (content: ContentResponse) => void;
}) {
  let imageSource = null;
  if (content.fileUrl) {
    imageSource = {
      uri: formatFileUrl(content.fileUrl),
    };
  }

  return (
    <VStack borderRadius="3xl">
      <Card
        onPress={() => {
          onPressContentCard?.(content);
        }}
        body={
          <HStack space={4}>
            {imageSource && (
              <Image
                alt="Conten Image"
                w="106"
                h="100"
                borderRadius="16"
                bg="rs_secondary.purple"
                alignSelf="center"
                source={imageSource}
                resizeMode="cover"
              />
            )}
            {!imageSource && (
              <Box
                w="106"
                h="100"
                bg="rs_secondary.purple"
                borderRadius="16"
                p="4"
                alignSelf="center"
                justifyContent="space-between"
                alignItems="flex-end"
              >
                <RacketBatIcon color="white" />
              </Box>
            )}
            <VStack flex={1} justifyContent="space-between">
              <Text
                fontWeight="700"
                fontSize="16"
                lineHeight={22}
                numberOfLines={3}
              >
                {content.title}
              </Text>

              {content.createdAt && (
                <HStack alignItems="center" mt="4">
                  <Text fontWeight="400" fontSize="sm">
                    {formatUtcToLocalDate(content.createdAt)}
                  </Text>
                </HStack>
              )}
            </VStack>
          </HStack>
        }
      />
    </VStack>
  );
}
