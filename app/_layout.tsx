import migrations from "@/drizzle/migrations";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";

export const unstable_settings = {
  anchor: "(tabs)",
};

export const DATABASE_NAME = "ezrecord";

function DatabaseInitializer() {
  const providerDb = useSQLiteContext();
  const db = drizzle(providerDb);
  useMigrations(db, migrations);
  return null;
}

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName={DATABASE_NAME}
      options={{ enableChangeListener: true }}
      useSuspense={false}
    >
      <ThemeProvider value={DefaultTheme}>
        <DatabaseInitializer />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
      <Toast position="bottom" bottomOffset={80} />
    </SQLiteProvider>
  );
}
