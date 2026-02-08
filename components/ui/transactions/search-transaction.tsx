import { InputField } from "@/components/input-field";
import { ThemedView } from "@/components/themed-view";
import { zodResolver } from "@/utils/zodResolver";
import { useForm } from "react-hook-form";
import { Pressable, StyleSheet } from "react-native";
import * as z from "zod";
import { IconSymbol } from "../icon-symbol";

const schema = z.object({
  name: z.string(),
});

type Props = {
  onSearch: (name: string) => void;
};

export function SearchTransaction({ onSearch }: Props) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = ({ name }: z.infer<typeof schema>) => {
    onSearch(name);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={{ flex: 1 }}>
        <InputField
          fieldName="name"
          control={control}
          placeholder="Search transaction"
          inputStyle={styles.input}
        />
      </ThemedView>
      <Pressable style={styles.searchButton} onPress={handleSubmit(onSubmit)}>
        <IconSymbol name="magnifyingglass" size={28} color="#F2F2F2" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "95%",
    flexDirection: "row",
    marginHorizontal: "auto",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    width: "98%",
  },
  searchButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#007AFF",
    borderRadius: 12,
  },
});
