import { Box, TextArea, Text, Button, Modal } from "native-base";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ClubResponse } from "../../models/responses/Club";
import { Player, Coach, ClubStaff } from "../../models/User";
import { formatName, getUserName } from "../../utils/name";
import { getTranslation } from "../../utils/translation";

const t = getTranslation([
  "component.Modal.RejectWithReasonModal",
  "constant.button",
]);

export interface RejectWithReasonProps {
  isOpen: boolean;
  onClose: () => void;
  onPressSubmit: (msg: string) => void;
  user?: Player | Coach | ClubStaff;
  club?: ClubResponse;
  rejectObject: { name: string };
}

export default function RejectWithReasonModal({
  isOpen,
  onClose,
  onPressSubmit,
  user,
  club,
  rejectObject,
}: RejectWithReasonProps) {
  const [rejectReasonCount, setRejectReasonCount] = useState<number>(0);
  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ rejectReason: string }>({ mode: "onChange" });
  const onSubmit = (data: { rejectReason: string }) =>
    onPressSubmit(data.rejectReason);
  const rejectReasonMaxLength = 300;
  const initialRef = React.useRef(null);

  return (
    <Modal
      avoidKeyboard
      isOpen={isOpen}
      onClose={onClose}
      initialFocusRef={initialRef}
      size="full"
      px="3"
    >
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Body m="3">
          <Box mt="10" position="relative">
            <Text>
              {t("Please provide reason for rejecting ")}
              {user && getUserName(user)}
              {club && club.name}
              {t("to apply")}
              {rejectObject.name}
            </Text>

            <TextArea
              h={200}
              maxLength={rejectReasonMaxLength}
              ref={initialRef}
              onChangeText={(val) => {
                setValue("rejectReason", val);
                setRejectReasonCount(val.length);
              }}
              autoCompleteType={undefined}
            />

            <Box position="absolute" minHeight="100" bottom="6" right="2">
              <Text>
                {rejectReasonCount} / {rejectReasonMaxLength}
              </Text>
            </Box>
            <Box>
              <Button
                mt="10"
                isLoading={isSubmitting}
                isLoadingText={t("Loading")}
                onPress={handleSubmit(onSubmit)}
              >
                {t("Submit")}
              </Button>
            </Box>
          </Box>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
