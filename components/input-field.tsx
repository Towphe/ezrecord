import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Controller } from "react-hook-form";
import { TextInput } from "react-native";

type InputFieldProps = {
  fieldName: string;
  fieldType?: string;
  label?: string;
  placeholder: string;
  control: any;
  containerStyle?: object;
  labelStyle?: object;
  inputStyle?: object;
  defaultValue?: any;
  disabled?: boolean;
};

export function InputField({
  fieldName,
  fieldType,
  label,
  placeholder,
  control,
  containerStyle,
  labelStyle,
  inputStyle,
  defaultValue,
  disabled = false,
}: InputFieldProps) {
  return (
    <ThemedView style={[containerStyle]}>
      {label && <ThemedText style={labelStyle}>{label}</ThemedText>}
      <Controller
        control={control}
        defaultValue={defaultValue}
        name={fieldName}
        render={({ field: { onChange, onBlur, value } }) => {
          return (
            <TextInput
              style={inputStyle}
              placeholder={placeholder}
              onBlur={onBlur}
              value={value ?? ""}
              onChangeText={(text) =>
                onChange(
                  fieldType === "number"
                    ? text === ""
                      ? undefined
                      : Number(text)
                    : text,
                )
              }
              placeholderTextColor="#999"
              editable={!disabled}
              autoCapitalize={fieldType === "number" ? "none" : "words"}
              keyboardType={fieldType === "number" ? "numeric" : "default"}
            />
          );
        }}
      />
    </ThemedView>
  );
}
