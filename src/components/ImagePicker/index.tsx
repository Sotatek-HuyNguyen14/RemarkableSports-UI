import React, { useState } from "react";
import { Pressable, Text, Image, Center, Circle } from "native-base";
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

import PencilIcon from "../Icons/PencilIcon";
import { getTranslation } from "../../utils/translation";
import { IMAGE_COMPRESS_QUALITY } from "../../constants/constants";
import { createRandomString } from "../../utils/strings";

interface ImagePickerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  controllerProps: UseControllerProps<TFieldValues, TName>;
  manipulateActions?: Action[];
  manipulateSaveOptions?: SaveOptions;
  defaultImageUrl?: string;
}

const t = getTranslation("component.ImagePicker");

export default function ImagePicker<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  controllerProps,
  defaultImageUrl,
  manipulateActions,
  manipulateSaveOptions,
}: ImagePickerProps<TFieldValues, TName>) {
  const {
    field: { value, onChange },
  } = useController(controllerProps);

  const [showDefaultImage, setShowDefaultImage] = useState(
    defaultImageUrl && defaultImageUrl !== undefined
  );

  let imageUri = defaultImageUrl;
  if (value && typeof value !== "string") {
    if (!manipulateSaveOptions || manipulateSaveOptions.base64) {
      imageUri = `data:image/${value.fileName.split(".")[1]};base64,${
        value.fileContent
      }`;
    } else {
      imageUri = value.fileContent;
    }
  }

  return (
    <Center>
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
        <Circle
          p={value || defaultImageUrl ? "0" : "12"}
          borderColor={value ? "rs.white" : "rs.black"}
          borderWidth="1"
        >
          {!value && !showDefaultImage ? (
            <Text position="absolute">{t("Profile\npicture")}</Text>
          ) : (
            <Image
              alt="Player icon"
              source={{
                uri: imageUri,
              }}
              boxSize="24"
              borderRadius="full"
              resizeMode="cover"
            />
          )}
          <Center
            p="4"
            position="absolute"
            bottom="0"
            right="0"
            bgColor="#66CEE1"
            borderRadius="full"
          >
            <Circle position="absolute">
              {!value ? <Text fontSize="xl">+</Text> : <PencilIcon />}
            </Circle>
          </Center>
        </Circle>
      </Pressable>
    </Center>
  );
}
