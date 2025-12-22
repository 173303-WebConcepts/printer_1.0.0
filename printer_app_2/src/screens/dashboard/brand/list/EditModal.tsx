import React, { useState } from "react";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from "@/components/ui/modal";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { View } from "react-native";
import { ThemedText } from "@/src/widgets/ThemeText";
import { Button, ButtonText } from "@/components/ui/button";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Formik } from "formik";
import * as Yup from "yup";
import CustomInput from "@/src/widgets/CustomInput";
import { axiosInstance } from "@/src/utils/axios";
import { Helper } from "@/src/utils/Helper";
import { FormControl } from "@/components/ui/form-control";

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Brand name is required").min(2, "Name must be at least 2 characters"),
});

const EditModal = ({ showModal, setShowModal, item, onSuccess, reFetch }: any) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      const res = await axiosInstance.put(`/category/brand/update/${item._id}`, {
        name: values.name.trim(),
      });

      if (res?.data?.success) {
        reFetch();
        Helper.res(res);
        setShowModal(false);
        if (onSuccess) onSuccess(); // optional: refetch list after update
      }
    } catch (error: any) {

      Helper.res(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
      <ModalBackdrop />
      <ModalContent className="bg-base-200 border-base-content-20 rounded-lg">
        <ModalHeader>
          <ThemedText className="text-xl font-grotes-bold flex-row items-center">
            Edit Category <Ionicons name="create-outline" size={22} className="text-info" style={{ marginLeft: 6 }} />
          </ThemedText>
          <ModalCloseButton>
            <Icon as={CloseIcon} className="text-base-content-70" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody className="mt-7">
          <Formik
            enableReinitialize
            initialValues={{
              name: item?.name || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleSubmit, values, errors, touched, submitCount }) => (
              <>
                <FormControl>
                  <CustomInput
                    label="Brand Name*"
                    icon="sparkles-outline"
                    placeholder="Brand name*"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    error={(touched.name || submitCount > 0) && errors.name ? errors.name : undefined}
                    className="!border-base-content-70 bg-base-300"
                  />
                </FormControl>

                <View className="justify-end items-center mt-5">
                  <Button variant="solid" size="md" action="primary" onPress={handleSubmit as any} isDisabled={isLoading}>
                    <ButtonText>{isLoading ? "Submitting..." : "Submit"}</ButtonText>
                  </Button>
                </View>
              </>
            )}
          </Formik>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditModal;
