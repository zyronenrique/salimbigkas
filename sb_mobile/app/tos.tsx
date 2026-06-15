import React, { Fragment } from 'react'
import { ScrollView, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

interface TosProps {
    visible: boolean;
    hideDialog: () => void;
}

const Tos = ({ visible, hideDialog }: TosProps) => {

    const text = [
        {
            title: "Definitions",
            content: [
                "Platform: the Salimbigkas web and mobile applications, websites, APIs, content, services and related features provided by Salimbigkas.",
                "User / you: anyone who accesses or uses the Platform — students, parents, teachers, administrators.",
                "Account: an authenticated user account.",
                "Content: lessons, quizzes, phrases, videos, audio, text, images, badges, user-generated content, and AI-generated content available on the Platform.",
                "AI Services: automated content generation performed by third-party AI provider, Firebase AI Logic by Google/Firebase and ElevenLabs."
            ]
        },
        {
            title: "Acceptance of Terms",
            content: [
                "By accessing or using the Platform, you accept and agree to these Terms. If you do not agree, do not use the Platform."
            ]
        },
        {
            title: "Eligibility & Parental Consent",
            content: [
                "The Platform is intended for elementary-level learners. If you are under the legal age of consent in your jurisdiction (or under 13 where applicable), you must register and use the Platform with the consent of a parent or legal guardian. Parents/guardians must provide consent during registration where required.",
                "Teachers and school administrators must be authorized by their institutions to use the Platform on behalf of students."
            ]
        },
        {
            title: "Account Security & Responsibility",
            content: [
                "You must provide accurate information when creating an Account. Keep your password secure. You are responsible for all activity occurring under your Account.",
                "Notify us immediately of any unauthorized use. We may suspend or terminate Accounts for suspicious activity.",
                "Teachers/Administrators are responsible for managing their class rosters and for verifying student accounts as required by school policy."
            ]
        },
        {
            title: "Use of the Platform",
            content: [
                "The Platform is for educational use only. Use the Platform honestly, lawfully, and consistent with these Terms and any school rules.",
                "Prohibited uses include (but are not limited to): cheating, uploading illegal content, harassment, circumventing access controls (e.g., attempting to unlock quizzes, levels, lessons without authorization), and attempting to access other users’ data."
            ]
        },
        {
            title: "Content, AI-Generated Material & Accuracy",
            content: [
                "The Platform includes content created by Salimbigkas, teachers, and AI. AI may be used to generate quizzes, phrases, text-to-speech,or recommendation",
                "AI-generated content is intended as an educational aid. While we strive for accuracy, AI outputs may sometimes be inaccurate or incomplete. You should not rely solely on AI outputs for grading or critical decisions without teacher review.",
                "Teachers are responsible for reviewing and approving AI-generated quizzes, phrases, text-to-speech, or lesson materials before assigning them to students (where applicable)."
            ]
        },
        {
            title: "User-Generated Content",
            content: [
                "Users (admins, teachers, students, parents) may upload content (e.g., answers, uploaded files). You grant Salimbigkas a non-exclusive, worldwide, royalty-free license to host, store, reproduce and display such content for Platform operation and improvement.",
                "Do not upload private personal data about others without consent. Salimbigkas may remove or disable content violating these Terms."
            ]
        },
        {
            title: "Intellectual Property",
            content: [
                "Salimbigkas and its licensors retain all intellectual property rights in the Platform and original content. You may not reproduce, modify, distribute, or create derivative works of our content except as expressly permitted.",
                "Teachers retain ownership of their teacher-created materials unless otherwise agreed; by uploading teacher content, you grant Salimbigkas a license to use and display it on the Platform."
            ]
        },
        {
            title: "Feedback & Improvements",
            content: [
                "If you provide feedback or suggestions, you grant Salimbigkas a perpetual, worldwide, royalty-free license to use, modify and commercialize such feedback."
            ]
        },
        {
            title: "Third-Party Services",
            content: [
                "The Platform may integrate third-party services (e.g., Firebase AI Logic for AI generation, Google/Firebase for hosting, ElevenLabs for text-to-speech). Use of third-party services is subject to their own terms and privacy policies.",
                "We do not control and are not responsible for third-party content or services."
            ]
        },
        {
            title: "Security & Privacy",
            content: [
                "Our Privacy Policy explains how we collect, use and disclose personal data. By using the Platform you consent to such collection and use.",
                "We implement security measures (encryption in transit and at rest for stored data, access controls) but cannot guarantee absolute security."
            ]
        },
        {
            title: "Suspension & Termination",
            content: [
                "We may suspend or terminate Accounts or access without notice for violations of these Terms, abuse, or legal reasons.",
                "On termination, some data may persist in backups for a period to comply with legal obligations or for fraud prevention."
            ]
        },
        {
            title: "Disclaimers",
            content: [
                "THE PLATFORM IS PROVIDED “AS IS.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, SALIMBIGKAS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
                "WE DO NOT WARRANT UNINTERRUPTED OR ERROR-FREE OPERATION, NOR GUARANTEE SPECIFIC EDUCATIONAL OUTCOMES."
            ]
        },
        {
            title: "Limitation of Liability",
            content: [
                "TO THE MAXIMUM EXTENT PERMITTED BY LAW, SALIMBIGKAS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES, OR FOR LOSS OF DATA, PROFITS, OR REPUTATION, ARISING OUT OF OR IN CONNECTION WITH THE PLATFORM."
            ]
        },
        {
            title: "Indemnification",
            content: [
                "You agree to indemnify and hold Salimbigkas harmless from claims arising from your violation of these Terms or your misuse of the Platform."
            ]
        },
        {
            title: "Changes to Terms",
            content: [
                "We may update these Terms. When significant changes occur, we’ll provide notice through the Teachers or Platform. Continued use after notice constitutes acceptance."
            ]
        },
        {
            title: "Governing Law & Dispute Resolution",
            content: [
                "These Terms are governed by the laws of the Republic of the Philippines. Disputes should first be attempted to be resolved informally. If unresolved, parties may pursue arbitration or courts of the Philippines."
            ]
        }
    ]

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={hideDialog} style={{ maxHeight: '80%', backgroundColor: '#2C3E50', borderWidth: 4, borderColor: '#fff' }}>
                <Dialog.Title style={{ fontWeight: 'bold', fontSize: 20, color: '#fff' }}>Terms of Service</Dialog.Title>
                <Dialog.ScrollArea>
                    <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
                        <View style={{ marginTop: 16, marginBottom: 16, gap: 4 }}>
                            <Text style={{ fontSize: 12, color: '#fff' }}>Effective Date: September 19, 2025</Text>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>Effective Date: September 19, 2025</Text>
                        </View>
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 16, color: '#fff' }}>
                                These Terms of Service (these “Terms”) govern your access to and use of the Salimbigkas E-Learning Platform (the “Platform”), provided by SYNERGY (“we”, “us”, or “Salimbigkas”). By accessing or using the Platform (including web and mobile apps), you agree to be bound by these Terms.
                            </Text>
                        </View>
                        <View style={{ marginBottom: 24 }}>
                            {text.map((section, idx) => (
                                <Fragment key={idx}>
                                    <Text variant="titleMedium" style={{ marginTop: idx === 0 ? 0 : 16, fontWeight: 'bold' }}>
                                        {section.title}
                                    </Text>
                                    {section.content.map((line, i) => (
                                        <Text key={i} style={{ marginTop: 4, marginBottom: 4 }}>
                                            {line}
                                        </Text>
                                    ))}
                                </Fragment>
                            ))}
                        </View>
                    </ScrollView>
                </Dialog.ScrollArea>
                <Dialog.Actions>
                    <Button onPress={hideDialog}>
                        <Text style={{ fontWeight: 'bold', color: '#fff' }}>Agree</Text>
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

export default Tos;