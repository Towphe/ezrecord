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
}: InputFieldProps) {
  return (
    <ThemedView style={[containerStyle]}>
      {label && <ThemedText style={labelStyle}>{label}</ThemedText>}
      <Controller
        control={control}
        name={fieldName}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={inputStyle}
            placeholder={placeholder}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="words"
            keyboardType={fieldType === "number" ? "numeric" : "default"}
          />
        )}
      />
    </ThemedView>
  );
}
