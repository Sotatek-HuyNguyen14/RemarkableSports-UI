import {
  Box,
  TextArea,
  Text,
  Button,
  Modal,
  Heading,
  VStack,
} from "native-base";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { getTranslation } from "../../utils/translation";

const t = getTranslation(["component.Modal.TextInputModal", "constant.button"]);

export interface TextInputModalProps {
  heading?: string;
  description?: string;
  footer?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onPressSubmit: (msg: string) => void;
}

export default function TextInputModal({
  isOpen,
  onClose,
  onPressSubmit,
  heading,
  description,
  footer,
}: TextInputModalProps) {
  const [inputCount, setInputCount] = useState<number>(0);
  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ input: string }>({ mode: "onChange" });
  const onSubmit = (data: { input: string }) => onPressSubmit(data.input);
  const inputMaxLength = 300;
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
          <VStack mt="4" space="2" position="relative">
            {heading && <Heading textAlign="center">{heading}</Heading>}
            {description && <Text textAlign="center">{description}</Text>}
            <TextArea
              h={200}
              maxLength={inputMaxLength}
              ref={initialRef}
              onChangeText={(val) => {
                setValue("input", val);
                setInputCount(val.length);
              }}
              autoCompleteType={undefined}
            />
            <Box alignSelf="flex-end">
              <Text>
                {inputCount} / {inputMaxLength}
              </Text>
            </Box>
            {footer && footer}
            <Box>
              <Button
                isLoading={isSubmitting}
                isLoadingText={t("Loading")}
                onPress={handleSubmit(onSubmit)}
              >
                {t("Submit")}
              </Button>
            </Box>
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
