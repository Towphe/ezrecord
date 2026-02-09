import { Controller } from "react-hook-form";
import RNPickerSelect from "react-native-picker-select";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type DropdownOption = {
  label: string;
  value: string | number;
};

type DropdownProps = {
  options: DropdownOption[];
  onChange: (value: string | number) => void;
  value: string | number;
  style?: object;
  placeHolder?: { label: string; value: null };
};

export function Dropdown({
  options,
  onChange,
  value,
  style,
  placeHolder,
}: DropdownProps) {
  return (
    <RNPickerSelect
      onValueChange={onChange}
      items={options}
      value={value}
      style={style}
      placeholder={placeHolder}
    />
  );
}

type DropdownFieldProps = {
  fieldName: string;
  items: DropdownOption[];
  label?: string;
  control: any;
  containerStyle?: object;
  inputStyle?: object;
  labelStyle?: object;
  defaultValue?: any;
  disabled?: boolean;
  onValueChange?: (value: any) => void;
};

export function DropdownField({
  fieldName,
  items,
  label,
  control,
  containerStyle,
  inputStyle,
  labelStyle,
  defaultValue,
  disabled = false,
  onValueChange,
}: DropdownFieldProps) {
  return (
    <ThemedView>
      {label && <ThemedText style={labelStyle}>{label}</ThemedText>}
      <ThemedView style={[containerStyle]}>
        <Controller
          control={control}
          defaultValue={defaultValue}
          name={fieldName}
          render={({ field: { onChange, onBlur, value } }) => {
            return (
              <Dropdown
                options={items}
                onChange={(v) => {
                  onChange(v);
                  onValueChange && onValueChange(v);
                }}
                value={value}
                placeHolder={defaultValue}
                style={inputStyle}
              />
            );
          }}
        />
      </ThemedView>
    </ThemedView>
  );
}
