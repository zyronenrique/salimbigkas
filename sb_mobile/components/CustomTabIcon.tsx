import { View, Text, Image } from 'react-native';

interface CustomTabIconProps {
  source: any;
  label: string;
  focused: boolean;
}

const CustomTabIcon = ({ source, label, focused }: CustomTabIconProps) => {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View
                style={{
                    position: focused ? 'absolute' : 'relative',
                    bottom: focused ? 10 : 0,
                    backgroundColor: focused ? '#fff' : 'transparent',
                    borderRadius: 40,
                    padding: focused ? 4 : 0,
                    elevation: focused ? 10 : 0,
                    shadowColor: focused ? '#000' : 'transparent',
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: focused ? 0.15 : 0,
                    shadowRadius: focused ? 6 : 0,
                }}
            >
                <View style={{ 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: focused ? '#2C3E50' : 'transparent',
                    borderRadius: 40,
                    padding: focused ? 8 : 0,
                }}>
                    <Image
                        source={source}
                        style={{
                            width: focused ? 40 : 34,
                            height: focused ? 40 : 34,
                        }}
                        resizeMode="contain"
                    />
                </View>
            </View>
            {focused && (
                <Text style={{ width: '100%', height: '100%', color: '#2C3E50', fontWeight: '900', fontSize: 18, marginTop: 40 }}>{label}</Text>
            )}
        </View>
    );
}

export default CustomTabIcon;
