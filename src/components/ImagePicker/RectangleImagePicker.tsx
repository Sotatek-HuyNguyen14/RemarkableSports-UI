import React, { useState } from "react";
import { Pressable, Text, Center, Box, HStack, Circle } from "native-base";
import { ImageBackground, ImageStyle } from "react-native";
import {
  UseControllerProps,
  useController,
  FieldValues,
  FieldPath,
} from "react-hook-form";
import * as SystemImagePicker from "expo-image-picker";
import {
  Action,
  manipulateAsync,
  SaveFormat,
  SaveOptions,
} from "expo-image-manipulator";
import { IMAGE_COMPRESS_QUALITY } from "../../constants/constants";
import AddIcon from "../Icons/AddIcon";
import CloseV2Icon from "../Icons/CloseV2Icon";
import { createRandomString } from "../../utils/strings";
import PencilIcon from "../Icons/PencilIcon";

interface RectangleImagePickerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  controllerProps: UseControllerProps<TFieldValues, TName>;
  imageProps?: ImageStyle;
  placeholderText?: string;
  showClose?: boolean;
  noPhotoComponent?: JSX.Element;
  manipulateActions?: Action[];
  manipulateSaveOptions?: SaveOptions;
  defaultImageUrl?: string;
  fullWidthImg?: boolean;
  onPressDelete?: () => void;
}

export default function RectangleImagePicker<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  controllerProps,
  imageProps,
  placeholderText,
  showClose = false,
  noPhotoComponent,
  manipulateActions,
  manipulateSaveOptions,
  defaultImageUrl,
  fullWidthImg = false,
  onPressDelete,
}: RectangleImagePickerProps<TFieldValues, TName>) {
  const {
    field: { value, onChange },
  } = useController(controllerProps);
  const defaultProps = {
    width: 229,
    height: 149,
    borderRadius: 16,
  };

  const [showDefaultImage, setShowDefaultImage] = useState(
    defaultImageUrl && defaultImageUrl !== undefined
  );

  return (
    <Box
      borderColor="rs.white"
      borderWidth="1"
      borderRadius={
        imageProps?.borderRadius
          ? imageProps?.borderRadius
          : defaultProps.borderRadius
      }
    >
      <Pressable
        onPress={async () => {
          const image = await SystemImagePicker.launchImageLibraryAsync();
          if (!image.cancelled) {
            const result = await manipulateAsync(
              image.uri,
              manipulateActions || [{ resize: { width: 1000 } }],
              {
                base64: true,
                compress: IMAGE_COMPRESS_QUALITY,
                format: SaveFormat.JPEG,
                ...manipulateSaveOptions,
              }
            );
            onChange({
              fileName: `profilePicture_${createRandomString(8)}.jpg`,
              fileContent: result.base64 || result.uri,
            });
          }
        }}
      >
        {!value && !showDefaultImage ? (
          noPhotoComponent || (
            <HStack
              shadow="9"
              style={{
                shadowOffset: {
                  width: 5,
                  height: 5,
                },
                shadowOpacity: 0.1,
              }}
              space={2}
              alignItems="center"
              borderColor="rs.white"
              borderRadius="2xl"
              borderWidth="1"
              bgColor="rs.white"
              px="4"
              py="6"
              fontSize="md"
              lineHeight="24"
            >
              <Box style={{ flexDirection: "row", alignItems: "center" }}>
                <AddIcon />
                <Text ml="2" fontSize="md">
                  {placeholderText}
                </Text>
              </Box>
            </HStack>
          )
        ) : (
          <ImageBackground
            source={{
              uri: value
                ? !manipulateSaveOptions || manipulateSaveOptions.base64
                  ? `data:image/${value.fileName.split(".")[1]};base64,${
                      value.fileContent
                    }`
                  : value.fileContent
                : `${defaultImageUrl}?${createRandomString(5)}`,
            }}
            style={[
              {
                borderRadius: imageProps?.borderRadius
                  ? imageProps?.borderRadius
                  : defaultProps.borderRadius,
                width: defaultProps.width,
                height: defaultProps.height,
              },
              { ...imageProps },
            ]}
            resizeMode="cover"
          >
            {showClose && (
              <Pressable
                onPress={() => {
                  setShowDefaultImage(undefined);
                  onPressDelete?.();
                  onChange(undefined);
                }}
              >
                <Center
                  position="absolute"
                  top="2"
                  right="2"
                  bgColor="rs.black"
                  borderRadius="full"
                >
                  <CloseV2Icon />
                </Center>
              </Pressable>
            )}

            <Center
              p="5"
              position="absolute"
              bottom="2"
              right="2"
              bgColor="rs.primary_purple"
              borderRadius="full"
              w="6"
              h="6"
            >
              <Circle position="absolute">
                <PencilIcon innterFill="white" size="lg" />
              </Circle>
            </Center>
          </ImageBackground>
        )}
      </Pressable>
    </Box>
  );
}
