import React from "react";
import { Pressable, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { Card, Loading } from "../components/ui";
import { colors } from "../theme";

import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { QuizzesScreen } from "../screens/QuizzesScreen";
import { ClassesScreen } from "../screens/ClassesScreen";
import { ClassDetailScreen } from "../screens/ClassDetailScreen";
import { ResultsScreen } from "../screens/ResultsScreen";
import { ResultDetailScreen } from "../screens/ResultDetailScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { AnnouncementsScreen } from "../screens/AnnouncementsScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { MessagesScreen, ChatScreen } from "../screens/MessagesScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { HelpScreen } from "../screens/HelpScreen";
import { QuizDetailScreen } from "../screens/QuizDetailScreen";

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 10,
        fontWeight: focused ? "800" : "600",
        color: focused ? colors.primary : colors.muted,
      }}
    >
      {label}
    </Text>
  );
}

function MoreMenu({ navigation }: any) {
  const items = [
    { label: "My Results", route: "Results" },
    { label: "Announcements", route: "Announcements" },
    { label: "Notifications", route: "Notifications" },
    { label: "Messages", route: "Messages" },
    { label: "Help", route: "Help" },
    { label: "Settings", route: "Settings" },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      {items.map((item) => (
        <Pressable key={item.route} onPress={() => navigation.navigate(item.route)}>
          <Card>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>{item.label}</Text>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}

function MoreNavigator() {
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { color: colors.navy, fontWeight: "700" },
        headerTintColor: colors.primary,
      }}
    >
      <MoreStack.Screen name="MoreMenu" component={MoreMenu} options={{ title: "More" }} />
      <MoreStack.Screen name="Results" component={ResultsScreen} options={{ title: "My Results" }} />
      <MoreStack.Screen name="Announcements" component={AnnouncementsScreen} />
      <MoreStack.Screen name="Notifications" component={NotificationsScreen} />
      <MoreStack.Screen name="Messages" component={MessagesScreen} />
      <MoreStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }: any) => ({ title: route.params?.title || "Chat" })}
      />
      <MoreStack.Screen name="Help" component={HelpScreen} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} />
    </MoreStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { color: colors.navy, fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          title: "Home",
          tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Quizzes"
        component={QuizzesScreen}
        options={{
          title: "My Quizzes",
          tabBarLabel: ({ focused }) => <TabLabel label="Quizzes" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Classes"
        component={ClassesScreen}
        options={{
          title: "My Classes",
          tabBarLabel: ({ focused }) => <TabLabel label="Classes" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: "Progress",
          tabBarLabel: ({ focused }) => <TabLabel label="Progress" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreNavigator}
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => <TabLabel label="More" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {!user ? (
          <RootStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <RootStack.Screen
              name="QuizDetail"
              component={QuizDetailScreen}
              options={{ title: "Take quiz", headerTintColor: colors.primary }}
            />
            <RootStack.Screen
              name="ResultDetail"
              component={ResultDetailScreen}
              options={{ title: "Result", headerTintColor: colors.primary }}
            />
            <RootStack.Screen
              name="ClassDetail"
              component={ClassDetailScreen}
              options={{ title: "Class", headerTintColor: colors.primary }}
            />
            <RootStack.Screen name="Results" component={ResultsScreen} options={{ title: "My Results" }} />
            <RootStack.Screen name="Announcements" component={AnnouncementsScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
