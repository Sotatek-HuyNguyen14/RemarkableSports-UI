import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  VStack,
  useTheme,
  Text,
  Button,
  Toast,
  Circle,
  Center,
  Box,
} from "native-base";
import { useForm } from "react-hook-form";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "../../../routers/Types";
import HeaderLayout from "../../../components/Layout/HeaderLayout";
import FormInput from "../../../components/FormInput/FormInput";
import { CreateClubRequest } from "../../../models/requests/Club";
import { getTranslation } from "../../../utils/translation";
import DownArrowIcon from "../../../components/Icons/DownArrowIcon";
import { getAllDistricts } from "../../../constants/Districts";
import RectangleImagePicker from "../../../components/ImagePicker/RectangleImagePicker";
import { createClub } from "../../../services/ClubServices";
import MessageToast, {
  MesssageToastType,
} from "../../../components/Toast/MessageToast";
import { useAuth } from "../../../hooks/UseAuth";
import { showApiToastError } from "../../../components/ApiToastError";
import SingleSelectModal from "../../../components/Modal/SingleSelectModal";
import AddIcon from "../../../components/Icons/AddIcon";

export type AddClubProps = NativeStackScreenProps<
  MainStackNavigatorParamList,
  "ClubAddClub"
>;

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

export default function AddClub({ navigation }: AddClubProps) {
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
  });
  const district = watch("district");

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
  const profileImage = watch("profileImage");

  useEffect(() => {
    if (district) setDistrict(district);
  }, [district, setDistrict]);
  const processSubmit = async (value: ClubValue) => {
    try {
      const formatData = {
        name: value.name,
        district: value.district,
        address: value.address,
        profileImage: value?.profileImage || null,
      };

      await createClub(formatData);
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
                title={t("Created")}
                body={t("Submitted successfully")}
              />
            );
          },
        });
      }
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "ClubNavigator",
          },
        ],
      });
    } catch (error: any) {
      console.log("createClub_error:", error);
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
        title: t("Club Creating"),
        containerStyle: {
          marginHorizontal: 0,
        },
      }}
    >
      <VStack space="4" flex="1">
        <RectangleImagePicker
          placeholderText={t("Club Profile Image")}
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
            <VStack borderColor="#000000" borderWidth={1}>
              <Box
                style={{ width: "100%", height: 220 }}
                justifyContent="center"
              >
                <Text fontSize={16} textAlign="center">
                  {t("Club Profile Image")}
                </Text>
              </Box>
              <Center
                p="5"
                position="absolute"
                bottom="2"
                right="2"
                borderRadius="full"
                w="6"
                h="6"
              >
                <Circle position="absolute">
                  <AddIcon />
                </Circle>
              </Center>
            </VStack>
          }
        />
        {/* <RectangleImagePicker
          placeholderText={t("Club Profile Image")}
          controllerProps={{
            name: "profileImage",
            control,
          }}
        /> */}
        <FormInput
          label={t("Name")}
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
        {/* <Heading>{t("Photo")}</Heading>
        <Text fontSize="sm" color="rs_secondary.grey">
          {t("Files smaller than 5mb")}
        </Text> */}
        {/* <RectangleImagePicker
          placeholderText={t("Photo")}
          controllerProps={{
            name: "profileImage",
            control,
          }}
        /> */}
        <Button
          style={{ marginTop: "auto" }}
          isDisabled={!isValid}
          isLoading={isSubmitting}
          isLoadingText={t("Loading")}
          onPress={handleSubmit(processSubmit)}
        >
          {t("Create")}
        </Button>
      </VStack>

      <SingleSelectModal
        isOpen={isOpen.district}
        onClose={() => {
          setIsOpen((prev) => ({ ...prev, district: false }));
        }}
        title={`${t("Select")}${t("District")}`}
        confirmButtonText={t("Confirm")}
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
