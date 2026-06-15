import React from 'react'
import { Button, Dialog, Portal, Text as TextPaper } from 'react-native-paper';

interface DialogProps {
    icon: string;
    title: string;
    content: string;
    visible: boolean;
    hideDialog: () => void;
    handleConfirm?: () => void;
}

const DialogComponent = ({ icon, title, content, visible, hideDialog, handleConfirm }: DialogProps) => {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={hideDialog} style={{ backgroundColor: '#2C3E50', borderWidth: 8, borderColor: '#fff' }}>
                <Dialog.Icon icon={icon} size={34} color='#FF0000' />
                <Dialog.Title style={{ textAlign: 'center', fontWeight: '900', fontSize: 20, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 8 }}>{title}</Dialog.Title>
                <Dialog.Content style={{ alignItems: 'center', marginBottom: 8 }}>
                    <TextPaper variant="bodyMedium" style={{ fontSize: 16, fontWeight: '500' }}>{content}</TextPaper>
                </Dialog.Content>
                {handleConfirm && (
                    <Dialog.Actions>
                        <Button onPress={hideDialog} style={{ backgroundColor: 'transparent', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 2, borderWidth: 1, borderColor: '#2C3E50' }}>
                            <TextPaper style={{ fontWeight: '900', color: '#fff' }}>No</TextPaper>
                        </Button>
                        <Button onPress={handleConfirm} style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 2 }}>
                            <TextPaper style={{ fontWeight: '900', color: '#fff' }}>Yes</TextPaper>
                        </Button>
                    </Dialog.Actions>
                )}
            </Dialog>
        </Portal>
    )
}

export default DialogComponent;
