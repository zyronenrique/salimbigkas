import React from 'react'
import { View, Text } from 'react-native';

const PasswordRequirements = ({ password }: { password: string }) => {
    return (
        <View style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0,
            width: '100%',
            zIndex: 9999, 
            paddingVertical: 12, 
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: '#2C3E50',
        }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2 }}>
                Password must:
            </Text>
            <View style={{ paddingLeft: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: password.length >= 8 ? '#ffa600' : '#aaa' }}>
                    • Be at least 8 characters
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: /[A-Z]/.test(password) ? '#ffa600' : '#aaa' }}>
                    • Contain an uppercase letter
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: /[a-z]/.test(password) ? '#ffa600' : '#aaa' }}>
                    • Contain a lowercase letter
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: /\d/.test(password) ? '#ffa600' : '#aaa' }}>
                    • Contain a number
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: /[@$!%*?&]/.test(password) ? '#ffa600' : '#aaa' }}>
                    • Contain a special character
                </Text>
            </View>
        </View>
    )
}

export default PasswordRequirements;