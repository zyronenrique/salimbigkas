import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import "../styles/index.css";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: '/loginPage',
      });
    }, 3000);
  }, []);
  
  return (
    <View style={[styles.container]}>
      <StatusBar style="dark" />
      <View style={styles.portfolio}>
        {isLoading && (
          <Image
            source={require('../assets/images/sb-symbol.svg')}
            style={styles.logo}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: '#fff',
  },
  portfolio: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});

