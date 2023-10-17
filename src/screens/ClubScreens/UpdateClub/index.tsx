import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  VStack,
  useTheme,
  Heading,
  Text,
  Button,
  Toast,
  Image,
  Center,
  Circle,
} from "native-base";
import { useForm } from "react-hook-form";
import {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { CompositeNavigationProp, RouteProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  ClubBottomTabNavigatorParamList,
  MainStackNavigatorParamList,
} from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import FormInput from "../../../components/FormInput/FormInput";
import { CreateClubRequest } from "../../../models/requests/Club";
import { getTranslation } from "../../../utils/translation";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import OneColumnPickerModal from "../../../components/Modal/OneColumnPickerModal";
import { getAllDistricts } from "../../../constants/Districts";
import RectangleImagePicker from "../../../components/ImagePicker/RectangleImagePicker";
import { deleteClub, updateClub } from "../../../services/ClubServices";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { formatFileUrl } from "../../../services/ServiceUtil";
import { useAuth } from "../../../hooks/UseAuth";
import { showApiToastError } from "../../../components/ApiToastError";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import ImageDirectory from "../../../assets";
import PencilIcon from "../../../components/Icons/PencilIcon";

export type UpdateClubNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackNavigatorParamList, "ClubUpdateClub">,
  BottomTabNavigationProp<ClubBottomTabNavigatorParamList>
>;

export type UpdateClubRouteProp = RouteProp<
  MainStackNavigatorParamList,
  "ClubUpdateClub"
>;

export interface UpdateClubScreenProps {
  navigation: UpdateClubNavigationProp;
  route: UpdateClubRouteProp;
}

interface ClubValue extends CreateClubRequest {
  districtText: string;
}

const t = getTranslation([
  "constant.district",
  "screen.ClubScreens.Club",
  "constant.button",
  "validation",
  "formInput",
]);
const SAVED_SUCCESSFUL_TOAST = "savedSuccessful";
const DELETE_SUCCESSFUL_TOAT = "deleteSuccessful";

export default function UpdateClub({
  navigation,
  route,
}: UpdateClubScreenProps) {
  const { club } = route.params;
  const theme = useTheme();
  const { updateUserInfo } = useAuth();
  const [isOpen, setIsOpen] = useState({
    district: false,
  });

  const Districts = useMemo(() => {
    return getAllDistricts();
  }, []);
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    watch,
    setValue,
  } = useForm<ClubValue>({
    mode: "onChange",
    defaultValues: {
      name: club.name,
      district: club.district,
      address: club.address,
    },
  });
  const district = watch("district");

  const [isClubDeleting, setClubDeleting] = useState(false);

  const setDistrict = useCallback(
    (newDistrict: string) => {
      const newLabel = Districts.reduce<string | null>((ret, val) => {
        if (val.value === newDistrict) {
          return val.label;
        }
        return ret;
      }, null);
      setValue("districtText", newLabel!, {
        shouldDirty: !!newLabel,
      });
      setValue("district", newDistrict, {
        shouldDirty: !!newLabel,
      });
    },
    [Districts, setValue]
  );

  useEffect(() => {
    if (district) setDistrict(district);
  }, [district, setDistrict]);

  const processSubmit = async (value: ClubValue) => {
    try {
      const formatData = {
        id: club.id,
        name: value.name,
        district: value.district,
        address: value.address,
        profileImage: value?.profileImage || null,
      };

      await updateClub(formatData);
      await updateUserInfo();
      if (!Toast.isActive(SAVED_SUCCESSFUL_TOAST)) {
        Toast.show({
          id: SAVED_SUCCESSFUL_TOAST,
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Updated")}
                body={t("Submitted successfully")}
              />
            );
          },
        });
      }
      // navigation.reset({
      //   index: 0,
      //   routes: [
      //     {
      //       name: "ClubNavigator",
      //     },
      //   ],
      // });
      if (navigation.canGoBack()) navigation.goBack();
    } catch (error: any) {
      showApiToastError(error);
    }
  };

  const onDeleteClub = async () => {
    try {
      setClubDeleting(true);
      await deleteClub(club.id);
      if (!Toast.isActive(DELETE_SUCCESSFUL_TOAT)) {
        Toast.show({
          id: DELETE_SUCCESSFUL_TOAT,
          duration: 2000,
          placement: "top",
          render: () => {
            return (
              <MessageToast
                type={MesssageToastType.Success}
                title={t("Deleted")}
                body={t("Deleted successfully")}
              />
            );
          },
        });
      }
      setClubDeleting(false);
      // navigation.reset({
      //   index: 0,
      //   routes: [
      //     {
      //       name: "ClubNavigator",
      //     },
      //   ],
      // });
      if (navigation.canGoBack()) navigation.goBack();
    } catch (error: any) {
      setClubDeleting(false);
      showApiToastError(error);
    }
  };

  return (
    <HeaderLayout
      containerProps={{ padding: theme.space.defaultLayoutSpacing }}
      KeyboardAwareScrollViewProps={{
        bounces: false,
      }}
      headerProps={{
        title: t("Club Updating"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
    >
      <VStack space="4" flex="1">
        <RectangleImagePicker
          defaultImageUrl={
            club.profilePicture ? formatFileUrl(club.profilePicture) : undefined
          }
          placeholderText={t("Photo")}
          controllerProps={{
            name: "profileImage",
            control,
          }}
          showClose={false}
          imageProps={{
            width: "100%",
            height: 220,
            borderRadius: 0,
            marginBottom: 8,
          }}
          noPhotoComponent={
            <VStack>
              <Image
                source={ImageDirectory.VENUE}
                style={{ width: "100%", height: 220 }}
              />
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
            </VStack>
          }
        />
        <FormInput
          label={t("Club Name")}
          controllerProps={{
            name: "name",
            control,
            rules: { required: t("is required") },
          }}
        />
        <FormInput
          label={t("District")}
          controllerProps={{
            name: "districtText",
            control,
            rules: {
              required: t("is required"),
            },
          }}
          inputProps={{
            editable: false,
            InputRightElement: <DownArrowIcon mr="4" />,
          }}
          onPress={() => {
            setIsOpen((prev) => ({ ...prev, district: true }));
          }}
        />

        <FormInput
          label={t("Address")}
          inputProps={{ multiline: true }}
          controllerProps={{
            name: "address",
            control,
            rules: { required: t("is required") },
          }}
        />

        <VStack w="100%" space="4" mt="auto">
          <Button
            isDisabled={!isValid || isClubDeleting}
            isLoading={isSubmitting}
            isLoadingText={t("Loading")}
            onPress={handleSubmit(processSubmit)}
          >
            {t("Save")}
          </Button>
          <Button
            variant="outline"
            isDisabled={isClubDeleting || isSubmitting}
            isLoading={isClubDeleting}
            isLoadingText={t("Loading")}
            onPress={onDeleteClub}
          >
            {t("Delete")}
          </Button>
        </VStack>
      </VStack>

      {/* <OneColumnPickerModal
        isOpen={isOpen.district}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, district: false }));
        }}
        headerLabel={`${t("Select")}${t("District")}`}
        buttonLabel={t("Confirm")}
        options={Districts}
        controllerProps={{
          name: "district",
          control,
          rules: { required: `${t("Club District")} ${t("is required")}` },
        }}
      /> */}
      <SingleSelectModal
        confirmButtonText={t("Confirm")}
        isOpen={isOpen.district}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, district: false }));
        }}
        title={`${t("Select")}${t("District")}`}
        buttonLabel={t("Confirm")}
        options={Districts}
        controllerProps={{
          name: "district",
          control,
          rules: { required: t("is required") },
        }}
      />
    </HeaderLayout>
  );
}
