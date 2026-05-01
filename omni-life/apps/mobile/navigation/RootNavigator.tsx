import React from 'react';
import {
  NavigationContainer,
  type ParamListBase,
} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import GoOutScreen from '../screens/GoOutScreen';
import StayInScreen from '../screens/StayInScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExploreLiveScreen from '../screens/ExploreLiveScreen';
import ExploreGamingScreen from '../screens/ExploreGamingScreen';
import ExploreNewsScreen from '../screens/ExploreNewsScreen';
import ExploreSportScreen from '../screens/ExploreSportScreen';
import ExploreLearningScreen from '../screens/ExploreLearningScreen';
import ExploreFashionScreen from '../screens/ExploreFashionScreen';
import ExplorePodcastsScreen from '../screens/ExplorePodcastsScreen';
import ExplorePlayablesScreen from '../screens/ExplorePlayablesScreen';
import LibraryYourChannelScreen from '../screens/LibraryYourChannelScreen';
import LibraryHistoryScreen from '../screens/LibraryHistoryScreen';
import LibraryPlaylistsScreen from '../screens/LibraryPlaylistsScreen';
import LibraryWatchLaterScreen from '../screens/LibraryWatchLaterScreen';
import LibraryLikedVideosScreen from '../screens/LibraryLikedVideosScreen';
import LibraryDownloadsScreen from '../screens/LibraryDownloadsScreen';
import FamilyStudioScreen from '../screens/FamilyStudioScreen';
import ParentDashboardScreen from '../screens/ParentDashboardScreen';

type RootStackParamList = {
  DrawerRoot: undefined;
};

type DrawerParamList = {
  HomeTabs: undefined;
  ExploreLive: undefined;
  ExploreGaming: undefined;
  ExploreNews: undefined;
  ExploreSport: undefined;
  ExploreLearning: undefined;
  ExploreFashion: undefined;
  ExplorePodcasts: undefined;
  ExplorePlayables: undefined;
  LibraryYourChannel: undefined;
  LibraryHistory: undefined;
  LibraryPlaylists: undefined;
  LibraryWatchLater: undefined;
  LibraryLikedVideos: undefined;
  LibraryDownloads: undefined;
  FamilyStudio: undefined;
  ParentDashboard: undefined;
};

type TabParamList = {
  Home: undefined;
  GoOut: undefined;
  StayIn: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const ScreenStack = createNativeStackNavigator();

const CORAL = '#FF9E80';
const MUTED = '#7B7B9A';

const DRAWER_LABELS: Record<keyof DrawerParamList, string> = {
  HomeTabs: 'Home',
  ExploreLive: 'Live',
  ExploreGaming: 'Gaming',
  ExploreNews: 'News',
  ExploreSport: 'Sport',
  ExploreLearning: 'Learning',
  ExploreFashion: 'Fashion',
  ExplorePodcasts: 'Podcasts',
  ExplorePlayables: 'Playables',
  LibraryYourChannel: 'Your Channel',
  LibraryHistory: 'History',
  LibraryPlaylists: 'Playlists',
  LibraryWatchLater: 'Watch Later',
  LibraryLikedVideos: 'Liked Videos',
  LibraryDownloads: 'Downloads',
  FamilyStudio: 'Family Studio',
  ParentDashboard: 'Parent Dashboard',
};

const DRAWER_SECTIONS: Array<{
  title: string;
  routes: Array<keyof DrawerParamList>;
}> = [
  {
    title: 'EXPLORE',
    routes: [
      'ExploreLive',
      'ExploreGaming',
      'ExploreNews',
      'ExploreSport',
      'ExploreLearning',
      'ExploreFashion',
      'ExplorePodcasts',
      'ExplorePlayables',
    ],
  },
  {
    title: 'LIBRARY',
    routes: [
      'LibraryYourChannel',
      'LibraryHistory',
      'LibraryPlaylists',
      'LibraryWatchLater',
      'LibraryLikedVideos',
      'LibraryDownloads',
    ],
  },
  {
    title: 'SAFETY',
    routes: ['FamilyStudio', 'ParentDashboard'],
  },
];

function DrawerIcon({ focused }: { focused: boolean }): JSX.Element {
  return (
    <View
      style={[
        styles.iconDot,
        { backgroundColor: focused ? CORAL : MUTED },
      ]}
    />
  );
}

function createDetailStack(
  title: string,
  Component: React.ComponentType,
): JSX.Element {
  return (
    <ScreenStack.Navigator>
      <ScreenStack.Screen name={title} component={Component} />
      <ScreenStack.Screen
        name={`${title}Details`}
        component={Component}
        options={{ title: `${title} Details` }}
      />
    </ScreenStack.Navigator>
  );
}

function TabNavigator(): JSX.Element {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CORAL,
        tabBarInactiveTintColor: MUTED,
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tabs.Screen name="GoOut" component={GoOutScreen} options={{ title: 'Go Out' }} />
      <Tabs.Screen
        name="StayIn"
        component={StayInScreen}
        options={{ title: 'Stay In' }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tabs.Navigator>
  );
}

function OmniDrawerContent({ state, navigation }: DrawerContentComponentProps): JSX.Element {
  return (
    <DrawerContentScrollView contentContainerStyle={styles.contentContainer}>
      <DrawerItem
        label={DRAWER_LABELS.HomeTabs}
        onPress={() => navigation.navigate('HomeTabs')}
        icon={({ focused }) => <DrawerIcon focused={focused} />}
        style={[
          styles.drawerItem,
          state.routeNames[state.index] === 'HomeTabs' && styles.drawerItemActive,
        ]}
        labelStyle={[
          styles.itemLabel,
          state.routeNames[state.index] === 'HomeTabs' && styles.itemLabelActive,
        ]}
      />

      {DRAWER_SECTIONS.map((section) => (
        <View key={section.title} style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{section.title}</Text>
          {section.routes.map((routeName) => {
            const isActive = state.routeNames[state.index] === routeName;
            return (
              <DrawerItem
                key={routeName}
                label={DRAWER_LABELS[routeName]}
                onPress={() => navigation.navigate(routeName)}
                icon={() => <DrawerIcon focused={isActive} />}
                style={[styles.drawerItem, isActive && styles.drawerItemActive]}
                labelStyle={[styles.itemLabel, isActive && styles.itemLabelActive]}
              />
            );
          })}
        </View>
      ))}
    </DrawerContentScrollView>
  );
}

function DrawerNavigator(): JSX.Element {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <OmniDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="HomeTabs" component={TabNavigator} />
      <Drawer.Screen
        name="ExploreLive"
        children={() => createDetailStack('Live', ExploreLiveScreen)}
      />
      <Drawer.Screen
        name="ExploreGaming"
        children={() => createDetailStack('Gaming', ExploreGamingScreen)}
      />
      <Drawer.Screen
        name="ExploreNews"
        children={() => createDetailStack('News', ExploreNewsScreen)}
      />
      <Drawer.Screen
        name="ExploreSport"
        children={() => createDetailStack('Sport', ExploreSportScreen)}
      />
      <Drawer.Screen
        name="ExploreLearning"
        children={() => createDetailStack('Learning', ExploreLearningScreen)}
      />
      <Drawer.Screen
        name="ExploreFashion"
        children={() => createDetailStack('Fashion', ExploreFashionScreen)}
      />
      <Drawer.Screen
        name="ExplorePodcasts"
        children={() => createDetailStack('Podcasts', ExplorePodcastsScreen)}
      />
      <Drawer.Screen
        name="ExplorePlayables"
        children={() => createDetailStack('Playables', ExplorePlayablesScreen)}
      />
      <Drawer.Screen
        name="LibraryYourChannel"
        children={() => createDetailStack('Your Channel', LibraryYourChannelScreen)}
      />
      <Drawer.Screen
        name="LibraryHistory"
        children={() => createDetailStack('History', LibraryHistoryScreen)}
      />
      <Drawer.Screen
        name="LibraryPlaylists"
        children={() => createDetailStack('Playlists', LibraryPlaylistsScreen)}
      />
      <Drawer.Screen
        name="LibraryWatchLater"
        children={() => createDetailStack('Watch Later', LibraryWatchLaterScreen)}
      />
      <Drawer.Screen
        name="LibraryLikedVideos"
        children={() => createDetailStack('Liked Videos', LibraryLikedVideosScreen)}
      />
      <Drawer.Screen
        name="LibraryDownloads"
        children={() => createDetailStack('Downloads', LibraryDownloadsScreen)}
      />
      <Drawer.Screen
        name="FamilyStudio"
        children={() => createDetailStack('Family Studio', FamilyStudioScreen)}
      />
      <Drawer.Screen
        name="ParentDashboard"
        children={() => createDetailStack('Parent Dashboard', ParentDashboardScreen)}
      />
    </Drawer.Navigator>
  );
}

export default function RootNavigator(): JSX.Element {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="DrawerRoot" component={DrawerNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 12,
  },
  sectionContainer: {
    marginTop: 8,
  },
  sectionHeader: {
    color: MUTED,
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 4,
    marginHorizontal: 16,
    textTransform: 'uppercase',
  },
  drawerItem: {
    borderRadius: 0,
    borderRightColor: 'transparent',
    borderRightWidth: 3,
  },
  drawerItemActive: {
    borderRightColor: CORAL,
  },
  itemLabel: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '500',
  },
  itemLabelActive: {
    color: CORAL,
    fontWeight: '700',
  },
  iconDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
});
