import React from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Platform } from "react-native";
import { NavigationContainer, DefaultTheme, type Theme } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors, drawerWidth, spacing } from "@omni-life/ui";

import { HomeMainScreen } from "../screens/HomeMainScreen";
import { GoOutScreen } from "../screens/GoOutScreen";
import { StayInScreen } from "../screens/StayInScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ExploreLiveScreen } from "../screens/ExploreLiveScreen";
import { ExploreGamingScreen } from "../screens/ExploreGamingScreen";
import { ExploreNewsScreen } from "../screens/ExploreNewsScreen";
import { ExploreSportScreen } from "../screens/ExploreSportScreen";
import { ExploreLearningScreen } from "../screens/ExploreLearningScreen";
import { ExploreFashionScreen } from "../screens/ExploreFashionScreen";
import { ExplorePodcastsScreen } from "../screens/ExplorePodcastsScreen";
import { ExplorePlayablesScreen } from "../screens/ExplorePlayablesScreen";
import { LibraryYourChannelScreen } from "../screens/LibraryYourChannelScreen";
import { LibraryHistoryScreen } from "../screens/LibraryHistoryScreen";
import { LibraryPlaylistsScreen } from "../screens/LibraryPlaylistsScreen";
import { LibraryWatchLaterScreen } from "../screens/LibraryWatchLaterScreen";
import { LibraryLikedVideosScreen } from "../screens/LibraryLikedVideosScreen";
import { LibraryDownloadsScreen } from "../screens/LibraryDownloadsScreen";
import { SafetyFamilyStudioScreen } from "../screens/SafetyFamilyStudioScreen";
import { SafetyParentDashboardScreen } from "../screens/SafetyParentDashboardScreen";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type DrawerRoute = {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  section?: "EXPLORE" | "LIBRARY" | "SAFETY";
};

const DRAWER_ROUTES: DrawerRoute[] = [
  { name: "MainTabs", title: "Home", icon: "home-outline" },
  { name: "ExploreLive", title: "Live", icon: "radio-outline", section: "EXPLORE" },
  { name: "ExploreGaming", title: "Gaming", icon: "game-controller-outline", section: "EXPLORE" },
  { name: "ExploreNews", title: "News", icon: "newspaper-outline", section: "EXPLORE" },
  { name: "ExploreSport", title: "Sport", icon: "football-outline", section: "EXPLORE" },
  { name: "ExploreLearning", title: "Learning", icon: "school-outline", section: "EXPLORE" },
  { name: "ExploreFashion", title: "Fashion", icon: "shirt-outline", section: "EXPLORE" },
  { name: "ExplorePodcasts", title: "Podcasts", icon: "mic-outline", section: "EXPLORE" },
  { name: "ExplorePlayables", title: "Playables", icon: "play-circle-outline", section: "EXPLORE" },
  { name: "LibraryYourChannel", title: "Your Channel", icon: "person-circle-outline", section: "LIBRARY" },
  { name: "LibraryHistory", title: "History", icon: "time-outline", section: "LIBRARY" },
  { name: "LibraryPlaylists", title: "Playlists", icon: "list-outline", section: "LIBRARY" },
  { name: "LibraryWatchLater", title: "Watch Later", icon: "bookmark-outline", section: "LIBRARY" },
  { name: "LibraryLikedVideos", title: "Liked Videos", icon: "heart-outline", section: "LIBRARY" },
  { name: "LibraryDownloads", title: "Downloads", icon: "download-outline", section: "LIBRARY" },
  { name: "SafetyFamilyStudio", title: "Family Studio", icon: "shield-checkmark-outline", section: "SAFETY" },
  { name: "SafetyParentDashboard", title: "Parent Dashboard", icon: "people-outline", section: "SAFETY" },
];

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.coral,
    background: colors.white,
    card: colors.white,
    text: colors.navy,
    border: colors.cream,
    notification: colors.liveRed,
  },
};

function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeMainScreen} />
    </Stack.Navigator>
  );
}

function GoOutStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoOutMain" component={GoOutScreen} />
    </Stack.Navigator>
  );
}

function StayInStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StayInMain" component={StayInScreen} />
    </Stack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

/**
 * Main tab row: Home · Go Out · Stay In · Profile.
 * Each tab hosts its own stack for detail flows (STEP 4 scaffold).
 */
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="GoOutTab"
        component={GoOutStackNavigator}
        options={{ title: "Go Out", tabBarIcon: ({ color, size }) => <Ionicons name="walk" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="StayInTab"
        component={StayInStackNavigator}
        options={{
          title: "Stay In",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const sectionHeaderStyle = {
  fontSize: 9,
  letterSpacing: 1.5,
  textTransform: "uppercase" as const,
  color: colors.muted,
  marginTop: spacing.md,
  marginBottom: spacing.sm,
  marginLeft: spacing.sm,
};

function OmniDrawerContent(props: DrawerContentComponentProps) {
  const { navigation, state } = props;
  const activeName = state.routeNames[state.index];

  let lastSection: string | undefined;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
      <Text style={styles.brand}>OMNI LIFE</Text>
      {DRAWER_ROUTES.map((route) => {
        const showHeader = route.section && route.section !== lastSection;
        if (route.section) lastSection = route.section;
        const isActive = activeName === route.name;
        return (
          <View key={route.name}>
            {showHeader ? <Text style={sectionHeaderStyle}>{route.section}</Text> : null}
            <Pressable
              onPress={() => navigation.navigate(route.name)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed, isActive && styles.rowActive]}
            >
              {isActive ? <View style={styles.pip} /> : null}
              <Ionicons name={route.icon} size={22} color={isActive ? colors.coral : colors.muted} style={styles.icon} />
              <Text style={[styles.label, isActive && styles.labelActive]}>{route.title}</Text>
            </Pressable>
          </View>
        );
      })}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerScroll: { paddingTop: spacing.lg },
  brand: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.navy,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    position: "relative",
  },
  rowPressed: { opacity: 0.85 },
  rowActive: { backgroundColor: `${colors.coral}18` },
  pip: {
    position: "absolute",
    right: 0,
    top: "25%",
    bottom: "25%",
    width: 3,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    backgroundColor: colors.coral,
  },
  icon: { marginRight: spacing.md },
  label: { fontSize: 15, color: colors.muted, fontWeight: "500" },
  labelActive: { color: colors.coral, fontWeight: "700" },
});

/**
 * Root navigation: Drawer (discovery) → default MainTabs (Home / Go Out / Stay In / Profile) with per-tab stacks.
 * Sidebar lists every named discovery screen from the product spec (Explore, Library, Safety).
 */
export function RootNavigator() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const drawerType = Platform.OS === "web" && isWide ? "permanent" : "slide";

  return (
    <NavigationContainer theme={navTheme}>
      <Drawer.Navigator
        drawerContent={(p) => <OmniDrawerContent {...p} />}
        screenOptions={{
          headerShown: true,
          headerTintColor: colors.navy,
          drawerType,
          drawerStyle: { width: drawerWidth },
          overlayColor: "rgba(26, 35, 126, 0.35)",
        }}
      >
        <Drawer.Screen name="MainTabs" component={MainTabNavigator} options={{ title: "Omni Life" }} />
        <Drawer.Screen name="ExploreLive" component={ExploreLiveScreen} options={{ title: "Live" }} />
        <Drawer.Screen name="ExploreGaming" component={ExploreGamingScreen} options={{ title: "Gaming" }} />
        <Drawer.Screen name="ExploreNews" component={ExploreNewsScreen} options={{ title: "News" }} />
        <Drawer.Screen name="ExploreSport" component={ExploreSportScreen} options={{ title: "Sport" }} />
        <Drawer.Screen name="ExploreLearning" component={ExploreLearningScreen} options={{ title: "Learning" }} />
        <Drawer.Screen name="ExploreFashion" component={ExploreFashionScreen} options={{ title: "Fashion" }} />
        <Drawer.Screen name="ExplorePodcasts" component={ExplorePodcastsScreen} options={{ title: "Podcasts" }} />
        <Drawer.Screen name="ExplorePlayables" component={ExplorePlayablesScreen} options={{ title: "Playables" }} />
        <Drawer.Screen name="LibraryYourChannel" component={LibraryYourChannelScreen} options={{ title: "Your Channel" }} />
        <Drawer.Screen name="LibraryHistory" component={LibraryHistoryScreen} options={{ title: "History" }} />
        <Drawer.Screen name="LibraryPlaylists" component={LibraryPlaylistsScreen} options={{ title: "Playlists" }} />
        <Drawer.Screen name="LibraryWatchLater" component={LibraryWatchLaterScreen} options={{ title: "Watch Later" }} />
        <Drawer.Screen name="LibraryLikedVideos" component={LibraryLikedVideosScreen} options={{ title: "Liked Videos" }} />
        <Drawer.Screen name="LibraryDownloads" component={LibraryDownloadsScreen} options={{ title: "Downloads" }} />
        <Drawer.Screen name="SafetyFamilyStudio" component={SafetyFamilyStudioScreen} options={{ title: "Family Studio" }} />
        <Drawer.Screen
          name="SafetyParentDashboard"
          component={SafetyParentDashboardScreen}
          options={{ title: "Parent Dashboard" }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
