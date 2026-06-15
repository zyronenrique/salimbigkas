import { useAuth } from '@/hooks/authContext';
import { useRouter } from 'expo-router';
import { MotiText, ScrollView } from 'moti';
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TouchableOpacity, View, Image, ActivityIndicator, TextInput } from 'react-native';
import { doUpdateUserProfile } from "../../firebase/auth";
import { FontAwesome5, MaterialIcons, Octicons } from '@expo/vector-icons';
import { useClassContext } from '@/hooks/classContext';
import { useLogRegContext } from '@/hooks/logRegContext';
import BumalikBtn from '@/components/bumalikBtn';

const ViewProfile = () => {
  const router = useRouter();
  const { currentUser, role, gradeLevels, gradeLevel, refreshUser } = useAuth();
  const { className } = useClassContext();
  const { setEmail, setReauthenticate } = useLogRegContext();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
      displayName: currentUser?.displayName || "",
      email: currentUser?.email || "",
      password: "",
      photoURL: currentUser?.photoURL,
      role: role,
      gradeLevel: gradeLevel,
      gradeLevels: gradeLevels || [],
      className: className || "N/A",
      emailVerified: currentUser?.emailVerified,
      phoneNumber: currentUser?.phoneNumber || "",
      createdAt: currentUser?.metadata?.creationTime,
      lastSignInTime: currentUser?.metadata?.lastSignInTime,
      updatedAt: new Date().toISOString(),
  });
  const [photoPreview, setPhotoPreview] = useState(profile.photoURL);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isRoleFocused, setIsRoleFocused] = useState(false);
  const [isGradeLevelFocused, setIsGradeLevelFocused] = useState(false);
  const [isClassFocused, setIsClassFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setProfile({
        displayName: currentUser?.displayName || "",
        email: currentUser?.email || "",
        password: "",
        photoURL: currentUser?.photoURL,
        role: role,
        gradeLevel: gradeLevel,
        gradeLevels: gradeLevels || [],
        className: className || "N/A",
        emailVerified: currentUser?.emailVerified,
        phoneNumber: currentUser?.phoneNumber || "",
        createdAt: currentUser?.metadata?.creationTime,
        lastSignInTime: currentUser?.metadata?.lastSignInTime,
        updatedAt: new Date().toISOString(),
    });
    setPhotoPreview(currentUser?.photoURL);
  }, [currentUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
        doUpdateUserProfile({
          displayName: profile.displayName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          photoFile,
        });
        await refreshUser();
        setEditMode(false);
    } catch (err: any) {
      let errorMsg = "An error occurred while updating your profile.";
      if (err.code === "auth/email-already-in-use") {
        errorMsg = "The email address is already in use. Please use a different email.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMsg = "Please verify your new email before changing email.";
      }else {
        errorMsg = err.message;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ 
      flex: 1, 
      paddingHorizontal: 16,
      paddingVertical: 12, 
      backgroundColor: '#2C3E50'
    }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <BumalikBtn
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}
            onPress={() => router.back()}
            size={24}
          />
          <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFA600' }}>View profile</Text>
          </View>
        </View>
        <View style={{
          backgroundColor: 'transparent', 
          borderRadius: 16, 
          padding: 12, 
          marginBottom: 24,
        }}>
          <View style={{flexDirection: 'column', marginBottom: 12}}>
            <View style={{position: 'relative', alignSelf: 'center', marginBottom: 16}}>
              <Image
                source={photoPreview ? { uri: photoPreview } : require('@/assets/images/man.png')}
                style={{width: 150, height: 150, borderRadius: 40, borderWidth: 3, borderColor: '#2C3E50'}}
                resizeMode='contain'
              />
              {editMode && (
                <View style={{position: 'absolute', top: 0, left: 0, width: 150, height: 150, borderRadius: 40, backgroundColor: 'rgba(44,62,80,0.4)', alignItems: 'center', justifyContent: 'center'}}>
                  <Text style={{fontSize: 28, color: '#fff'}}>📷</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ width: '100%', position: 'relative', marginTop: 8 }}>
                <MotiText
                  animate={{
                    top: isNameFocused || profile.displayName ? -14 : 18,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 200,
                  }}
                  style={{
                    position: 'absolute',
                    left: 16,
                    zIndex: 2,
                    backgroundColor: isNameFocused || profile.displayName ? '#2C3E50' : 'transparent',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 8,
                    fontSize: isNameFocused || profile.displayName ? 16 : 18,
                    fontWeight: '900',
                    color: '#fff',
                  }}
                >
                  {editMode ? <Text style={{ color: '#FFA600' }}>Edit </Text> : ""}Full name
                </MotiText>
                <TextInput
                  style={{
                    height: 70,
                    marginBottom: 12,
                    backgroundColor: 'white',
                    paddingHorizontal: 18,
                    paddingRight: 48,
                    borderRadius: 8,
                    padding: 12,
                    elevation: 2,
                    fontSize: 18,
                  }}
                  maxLength={30}
                  value={profile.displayName}
                  onChangeText={text => setProfile({ ...profile, displayName: text })}
                  keyboardType="default"
                  autoCapitalize="words"
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  editable={editMode && !loading}
                />
                <FontAwesome5 style={{ position: 'absolute', top: 20, right: 12 }} name="user-alt" size={24} color="#2C3E50" />
              </View>
              <View style={{ width: '100%', position: 'relative', marginTop: 8 }}>
                <MotiText
                  animate={{
                    top: isEmailFocused || profile.email ? -14 : 18,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 200,
                  }}
                  style={{
                    position: 'absolute',
                    left: 16,
                    zIndex: 2,
                    backgroundColor: isEmailFocused || profile.email ? '#2C3E50' : 'transparent',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 8,
                    fontSize: isEmailFocused || profile.email ? 16 : 18,
                    fontWeight: '900',
                    color: '#fff',
                  }}
                >
                  Email
                </MotiText>
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={() => setIsEmailFocused(true)}
                  onPressOut={() => setIsEmailFocused(false)}
                  style={{
                    height: 70,
                    marginBottom: 12,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    borderColor: '#ccc',
                    borderWidth: .25,
                    elevation: 2,
                    paddingHorizontal: 18,
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{profile.email}</Text>
                </TouchableOpacity>
                <View style={{ position: 'absolute', top: 20, right: 12, zIndex: 2, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name="check-circle" size={24} color="green" />
                  <MaterialIcons name="email" size={28} color="#2C3E50" />
                </View>
              </View>
              <View style={{ width: '100%', position: 'relative', marginTop: 8 }}>
                <MotiText
                  animate={{
                    top: isRoleFocused || role ? -14 : 18,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 200,
                  }}
                  style={{
                    position: 'absolute',
                    left: 16,
                    zIndex: 2,
                    backgroundColor: isRoleFocused || role ? '#2C3E50' : 'transparent',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 8,
                    fontSize: isRoleFocused || role ? 16 : 18,
                    fontWeight: '900',
                    color: '#fff',
                  }}
                >
                  Role
                </MotiText>
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={() => setIsRoleFocused(true)}
                  onPressOut={() => setIsRoleFocused(false)}
                  style={{
                    height: 70,
                    marginBottom: 12,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    borderColor: '#ccc',
                    borderWidth: .25,
                    elevation: 2,
                    paddingHorizontal: 18,
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{profile.role}</Text>
                </TouchableOpacity>
                <FontAwesome5 style={{ position: 'absolute', top: 20, right: 12, zIndex: 2 }} name="user-alt" size={24} color="#2C3E50" />
              </View>
              <View style={{ width: '100%', position: 'relative', marginTop: 8 }}>
                <MotiText
                  animate={{
                    top: isGradeLevelFocused || profile.gradeLevel ? -14 : 18,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 200,
                  }}
                  style={{
                    position: 'absolute',
                    left: 16,
                    zIndex: 2,
                    backgroundColor: isGradeLevelFocused || profile.gradeLevel ? '#2C3E50' : 'transparent',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 8,
                    fontSize: isGradeLevelFocused || profile.gradeLevel ? 16 : 18,
                    fontWeight: '900',
                    color: '#fff',
                  }}
                >
                  Grade Level
                </MotiText>
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={() => setIsGradeLevelFocused(true)}
                  onPressOut={() => setIsGradeLevelFocused(false)}
                  style={{
                    height: 70,
                    marginBottom: 12,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    borderColor: '#ccc',
                    borderWidth: .25,
                    elevation: 2,
                    paddingHorizontal: 18,
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{profile.gradeLevel}</Text>
                </TouchableOpacity>
                <FontAwesome5 style={{ position: 'absolute', top: 20, right: 12, zIndex: 2 }} name="user-alt" size={24} color="#2C3E50" />
              </View>
              <View style={{ width: '100%', position: 'relative', marginTop: 8 }}>
                <MotiText
                  animate={{
                    top: isClassFocused || profile.className ? -14 : 18,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 200,
                  }}
                  style={{
                    position: 'absolute',
                    left: 16,
                    zIndex: 2,
                    backgroundColor: isClassFocused || profile.className ? '#2C3E50' : 'transparent',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 8,
                    fontSize: isClassFocused || profile.className ? 16 : 18,
                    fontWeight: '900',
                    color: '#fff',
                  }}
                >
                  Class
                </MotiText>
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={() => setIsClassFocused(true)}
                  onPressOut={() => setIsClassFocused(false)}
                  style={{
                    height: 70,
                    marginBottom: 12,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    borderColor: '#ccc',
                    borderWidth: .25,
                    elevation: 2,
                    paddingHorizontal: 18,
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{profile.className}</Text>
                </TouchableOpacity>
                <View style={{ position: 'absolute', top: 20, right: 12, zIndex: 2, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                  {className ? (
                    <MaterialIcons name="check-circle" size={24} color="green" />
                  ):(
                    <Octicons name="x-circle-fill" size={24} color="red" />
                  )}
                  <FontAwesome5 name="user-alt" size={24} color="#2C3E50" />
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={{flex: 1, flexDirection: 'row', gap: 8, backgroundColor: '#fff', marginBottom: 16, paddingVertical: 20, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center'}} 
            onPress={() => {
              setEmail(profile.email);
              setReauthenticate(true);
              router.navigate('/profile/reauthenticatePage');
            }}
          >
            <MaterialIcons name="mode-edit" size={24} color="#2C3E50" />
            <Text style={{textAlign: 'center', color: '#2C3E50', fontWeight: 'bold', fontSize: 18}}>Change Email</Text>
          </TouchableOpacity>
          <View style={{flex: 1, flexDirection: 'column', flexWrap: 'wrap', marginTop: 4 }}>
            <Detail label="Member Since" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"} />
            <Detail label="Last Sign-In" value={profile.lastSignInTime ? new Date(profile.lastSignInTime).toLocaleDateString() : "N/A"} />
          </View>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 24}}>
            {editMode ? (
              <>
                <TouchableOpacity
                  style={{width: '48%', backgroundColor: '#27ae60', paddingVertical: 20, paddingHorizontal: 24, borderRadius: 24 }}
                  disabled={loading}
                  onPress={handleSave}
                >
                  {loading ? <ActivityIndicator color="#2C3E50" /> : <Text style={{textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Save</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{width: '48%', backgroundColor: '#bdc3c7', paddingVertical: 20, paddingHorizontal: 24, borderRadius: 24 }}
                  disabled={loading}
                  onPress={() => setEditMode(false)}
                >
                  <Text style={{textAlign: 'center', color: '#2C3E50', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={{flex: 1, flexDirection: 'row', gap: 8, backgroundColor: '#fff', paddingVertical: 20, paddingHorizontal: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center'}} 
                onPress={() => setEditMode(true)}
              >
                <MaterialIcons name="mode-edit" size={24} color="#2C3E50" />
                <Text style={{textAlign: 'center', color: '#2C3E50', fontWeight: 'bold', fontSize: 18}}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
};

type DetailProps = {
  label: string;
  value: string;
  color?: string;
};

const Detail = ({ label, value, color }: DetailProps) => (
  <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 4, marginBottom: 12}}>
    <Text style={{fontSize: 16, color: '#fff'}}>{label}</Text>
    <Text style={[{fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 2}, color && { color }]}>{value}</Text>
  </View>
);

export default ViewProfile
