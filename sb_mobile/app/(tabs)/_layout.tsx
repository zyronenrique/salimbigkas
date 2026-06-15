import React, { useCallback, useMemo } from 'react';
import { Tabs } from 'expo-router';
import { imageSrc } from '@/Icons/icons';
import CustomTabIcon from '@/components/CustomTabIcon';

export default function TabLayout() {
  const tabBarStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: 0,
    right: 0,
    height: 72,
    elevation: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: '#FFF',
  }), []);

  const baseScreenOptions = useMemo(() => ({
    animation: 'shift' as const,
    tabBarStyle,
    tabBarItemStyle: { paddingVertical: 8 },
    tabBarLabelStyle: {
      color: '#2C3E50',
      fontSize: 14,
      fontWeight: 'bold' as const,
    },
    tabBarShowLabel: false,
    headerShown: false,
  }), [tabBarStyle]);

  const hiddenTabBarStyle = useMemo(() => ({ display: 'none' as const }), []);

  const renderHomeIcon = useCallback(({ focused }: { focused: boolean }) => (
    <CustomTabIcon source={imageSrc.homeTab} label="Home" focused={focused} />
  ), []);
  const renderLessonsIcon = useCallback(({ focused }: { focused: boolean }) => (
    <CustomTabIcon source={imageSrc.lessonTab} label="Lessons" focused={focused} />
  ), []);
  const renderBigkasIcon = useCallback(({ focused }: { focused: boolean }) => (
    <CustomTabIcon source={imageSrc.bigkasTab} label="Bigkas" focused={focused} />
  ), []);
  const renderSeatworkIcon = useCallback(({ focused }: { focused: boolean }) => (
    <CustomTabIcon source={imageSrc.seatworkTab} label="Seatwork" focused={focused} />
  ), []);
  const renderQuizIcon = useCallback(({ focused }: { focused: boolean }) => (
    <CustomTabIcon source={imageSrc.quizTab} label="Quiz" focused={focused} />
  ), []);
  const renderProfileIcon = useCallback(({ focused }: { focused: boolean }) => (
    <CustomTabIcon source={imageSrc.profileTab} label="Profile" focused={focused} />
  ), []);

  const homeOptions = useMemo(() => ({ tabBarIcon: renderHomeIcon }), [renderHomeIcon]);
  const lessonsOptions = useMemo(() => ({ tabBarIcon: renderLessonsIcon }), [renderLessonsIcon]);
  const bigkasOptions = useMemo(() => ({ tabBarIcon: renderBigkasIcon, tabBarStyle: hiddenTabBarStyle }), [renderBigkasIcon, hiddenTabBarStyle]);
  const seatworkOptions = useMemo(() => ({ tabBarIcon: renderSeatworkIcon, tabBarStyle: hiddenTabBarStyle }), [renderSeatworkIcon, hiddenTabBarStyle]);
  const quizOptions = useMemo(() => ({ tabBarIcon: renderQuizIcon, tabBarStyle: hiddenTabBarStyle }), [renderQuizIcon, hiddenTabBarStyle]);
  const profileOptions = useMemo(() => ({ tabBarIcon: renderProfileIcon }), [renderProfileIcon]);

  return (
    <Tabs screenOptions={baseScreenOptions}>
      <Tabs.Screen name="index" options={homeOptions} />
      <Tabs.Screen name="two" options={lessonsOptions} />
      <Tabs.Screen name="three" options={bigkasOptions} />
      <Tabs.Screen name="four" options={seatworkOptions} />
      <Tabs.Screen name="five" options={quizOptions} />
      <Tabs.Screen name="six" options={profileOptions} />
    </Tabs>
  );
}
