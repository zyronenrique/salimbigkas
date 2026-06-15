import { Octicons } from '@expo/vector-icons';
import React from 'react'
import { Modal, View, Text, TouchableOpacity } from 'react-native';


interface SelectCategoryModalProps {
    question: any;
    selectedItem?: string | null;
    visible: boolean;
    onRequestClose: () => void;
    categorySelect: (category: number) => void;
}

const SelectCategoryModal = ({ question, selectedItem, visible, onRequestClose, categorySelect }: SelectCategoryModalProps) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onRequestClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
            }}>
                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 24,
                    maxWidth: 400,
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginBottom: 8,
                        textAlign: 'center',
                        color: '#1f2937',
                    }}>
                        Select a category for:
                    </Text>
                    <Text style={{
                        textAlign: 'center',
                        fontSize: 16,
                        color: '#4b5563',
                        fontWeight: 'bold',
                        marginBottom: 12,
                    }}>"{selectedItem}"</Text>
                    <View style={{
                        gap: 12,
                        flexDirection: 'column',
                    }}>
                        {question.categories.map((category: string, index: number) => (
                            <TouchableOpacity
                                key={index}
                                style={{
                                    backgroundColor: '#2C3E50',
                                    padding: 16,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    elevation: 5,
                                }}
                                onPress={() => categorySelect(index)}
                            >
                                <Text style={{
                                    textAlign: 'center',
                                    color: 'white',
                                    fontSize: 16,
                                    fontWeight: '600',
                                }}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={{
                            position: 'absolute', 
                            top: 5, 
                            right: 5,
                        }}
                        onPress={onRequestClose}
                    >
                        <Octicons 
                            name="x-circle-fill" 
                            size={24} 
                            color="#2C3E50"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
};

export default SelectCategoryModal