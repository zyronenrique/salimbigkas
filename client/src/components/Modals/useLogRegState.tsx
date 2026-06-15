import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../../hooks/authContext';
import { doCreateUserWithEmailAndPassword, doSignInWithEmailAndPassword, doSignInWithFacebook, doSignInWithGoogle } from '../../firebase/auth';
import { auth } from '../../firebase/firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUsersContext } from '../../hooks/usersContext';
import { doCreateUser, doUpdateUser } from '../../api/functions';
import { toast } from 'react-toastify';
import CustomToast from '../Toast/CustomToast';
import { checkUserStatus } from '../../utils/helpers';

interface LogRegState {
    fullName: string;
    email: string;
    password: string;
    isPasswordFocused: boolean;
    accountType: string;
    role: string;
    singleGradeLevel: string;
    multipleGradeLevels: string[];
    selectInputValue: string;
    isRegistering: boolean;
    isSigningIn: boolean;
    isSigningInWithGoogle: boolean;
    isSigningInWithFacebook: boolean;
    errorMessage: string;
    showPassword: boolean;
    rememberMe: boolean;
    showVerificationModal: boolean;
    showForgotPasswordModal: boolean;
    showRestrictedModal: boolean;
    shouldNavigate: boolean;
    isLoading: boolean;
    error: string | null;
}

export const useLogRegState = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { setLoading, currentUser, role: userRole, gradeLevels, gradeLevel } = useAuth();
    const { selectedUser, isEditingUser } = useUsersContext();
    const [state, setState] = useState<LogRegState>({
        fullName: isEditingUser ? selectedUser?.fullName : "",
        email: isEditingUser ? selectedUser?.email : "",
        password: "",
        isPasswordFocused: false,
        accountType: "",
        role: isEditingUser ? selectedUser?.role : "",
        singleGradeLevel: isEditingUser ? selectedUser?.gradeLevel : "",
        multipleGradeLevels: isEditingUser ? selectedUser?.gradeLevels : [],
        selectInputValue: "",
        isRegistering: false,
        isSigningIn: false,
        isSigningInWithGoogle: false,
        isSigningInWithFacebook: false,
        errorMessage: "",
        showPassword: false,
        rememberMe: true,
        showVerificationModal: false,
        showForgotPasswordModal: false,
        showRestrictedModal: false,
        shouldNavigate: false,
        isLoading: false,
        error: null,
    });

    useEffect(() => {
        setState(prev => ({
            ...prev,
            fullName: isEditingUser ? selectedUser?.displayName : "",
            email: isEditingUser ? selectedUser?.email : "",
            role: isEditingUser ? selectedUser?.role : "",
            singleGradeLevel: isEditingUser ? selectedUser?.gradeLevel : "",
            multipleGradeLevels: isEditingUser ? selectedUser?.gradeLevels : [],
        }));
    }, [selectedUser, isEditingUser]);
    
    const updateState = useCallback((updates: Partial<LogRegState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const fullName = state.fullName;
    const email = state.email;
    const password = state.password;
    const isPasswordFocused = state.isPasswordFocused;
    const accountType = state.accountType;
    const role = state.role;
    const singleGradeLevel = state.singleGradeLevel;
    const multipleGradeLevels = state.multipleGradeLevels;
    const selectInputValue = state.selectInputValue;
    const isRegistering = state.isRegistering;
    const isSigningIn = state.isSigningIn;
    const isSigningInWithGoogle = state.isSigningInWithGoogle;
    const isSigningInWithFacebook = state.isSigningInWithFacebook;
    const errorMessage = state.errorMessage;
    const showPassword = state.showPassword;
    const rememberMe = state.rememberMe;
    const showVerificationModal = state.showVerificationModal;
    const showForgotPasswordModal = state.showForgotPasswordModal;
    const showRestrictedModal = state.showRestrictedModal;
    const shouldNavigate = state.shouldNavigate;
    const isLoading = state.isLoading;
    const error = state.error;
    const setFullName = useCallback((fullName: string) => updateState({ fullName }), []);
    const setEmail = useCallback((email: string) => updateState({ email }), []);
    const setPassword = useCallback((password: string) => updateState({ password }), []);
    const setIsPasswordFocused = useCallback((isPasswordFocused: boolean) => updateState({ isPasswordFocused }), []);
    const setAccountType = useCallback((accountType: string) => updateState({ accountType }), []);
    const setRole = useCallback((role: string) => updateState({ role }), []);
    const setSingleGradeLevel = useCallback((singleGradeLevel: string) => updateState({ singleGradeLevel }), []);
    const setMultipleGradeLevels = useCallback((multipleGradeLevels: string[]) => updateState({ multipleGradeLevels }), []);
    const setSelectInputValue = useCallback((selectInputValue: string) => updateState({ selectInputValue }), []);
    const setIsRegistering = useCallback((isRegistering: boolean) => updateState({ isRegistering }), []);
    const setShowPassword = useCallback((showPassword: boolean) => updateState({ showPassword }), []);
    const setRememberMe = useCallback((rememberMe: boolean) => updateState({ rememberMe }), []);
    const setIsSigningIn = useCallback((isSigningIn: boolean) => updateState({ isSigningIn }), []);
    const setIsSigningInWithGoogle = useCallback((isSigningInWithGoogle: boolean) => updateState({ isSigningInWithGoogle }), []);
    const setIsSigningInWithFacebook = useCallback((isSigningInWithFacebook: boolean) => updateState({ isSigningInWithFacebook }), []);
    const setShowVerificationModal = useCallback((showVerificationModal: boolean) => updateState({ showVerificationModal }), []);
    const setShowForgotPasswordModal = useCallback((showForgotPasswordModal: boolean) => updateState({ showForgotPasswordModal }), []);
    const setShowRestrictedModal = useCallback((showRestrictedModal: boolean) => updateState({ showRestrictedModal }), []);
    const setShouldNavigate = useCallback((shouldNavigate: boolean) => updateState({ shouldNavigate }), []);
    const setIsLoading = useCallback((isLoading: boolean) => updateState({ isLoading }), []);
    const setErrorMessage = useCallback((errorMessage: string) => updateState({ errorMessage }), []);

    const formatGradeLevelForRoute = (level: string) => level.replace(/\s+/g, "").toLowerCase();
    const formattedGradeLevels = (gradeLevels || []).map(formatGradeLevelForRoute).join("~");
    const formattedGradeLevel = gradeLevel ? formatGradeLevelForRoute(gradeLevel) : formattedGradeLevels || "none";

    useEffect(() => {
        setSingleGradeLevel("");
        setMultipleGradeLevels([]);
    }, [accountType]);

    const handleUserRegister = useCallback(async () => {
        if (!isEditingUser && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
            setErrorMessage(
                "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
            );
            return;
        }
        if (!isRegistering) {
            setIsRegistering(true);
            setErrorMessage("");
            setLoading(true);
            try {
                let response: any;
                let userId = currentUser?.uid || "";
                if (isEditingUser) {
                    response = await doUpdateUser(
                        userId,
                        selectedUser.uid,
                        fullName,
                        email,
                        password,
                        role,
                        multipleGradeLevels,
                        singleGradeLevel,
                    ) as any;
                } else {
                    response = await doCreateUser(
                        userId,
                        fullName,
                        email,
                        password,
                        role,
                        multipleGradeLevels,
                        singleGradeLevel,
                    ) as any;
                }
                if (response?.success) {
                    toast.success(
                        <CustomToast
                            title="Congratulation!"
                            subtitle={`User ${isEditingUser ? "updated" : "registered"} successfully`}
                        />,
                    );
                    navigate(-1);
                } else {
                    toast.error(
                        <CustomToast
                            title="Something went wrong!"
                            subtitle={`An error occurred while ${isEditingUser ? "updating" : "creating"} the user. Please try again.`}
                        />,
                    );
                }
            } catch (error) {
                setErrorMessage("The email address is already in use. Please use a different email.");
            } finally {
                setIsRegistering(false);
                setLoading(false);
            }
        }
    }, [isEditingUser, selectedUser, fullName, email, password, role, multipleGradeLevels, singleGradeLevel]);

    // Handle email/password login
    let code: string;
    let errorMsg: string;

    const handleRegister = useCallback(async () => {
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
          setErrorMessage(
            "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
          );
          return;
        }
        if (!isRegistering) {
            setIsRegistering(true);
            setErrorMessage("");
            setLoading(true);
            try {
                const response = await doCreateUserWithEmailAndPassword(
                    email,
                    password,
                    fullName,
                    true,
                    accountType,
                    multipleGradeLevels,
                    singleGradeLevel,
                ) as any;
                if (response?.success) {
                    setShowVerificationModal(true);
                }
            } catch (error) {
                code = (error as any).code;
                if (code === "auth/email-already-in-use") {
                    errorMsg = "The email address is already in use. Please use a different email.";
                } else if (code === "auth/operation-not-allowed") {
                    errorMsg = "Registration is currently disabled. Please contact support.";
                } else if (code === "auth/user-disabled") {
                    errorMsg = "Access restricted: Your account is under review. Please contact the school administrator.";
                } else {
                    errorMsg = "Registration failed. Please try again.";
                }
                setErrorMessage(errorMsg);
            } finally {
                setIsRegistering(false);
                setLoading(false);
            }
        }
    }, [email, password, fullName, accountType, multipleGradeLevels, singleGradeLevel]);

    const handleLogin = useCallback(async () => {
        if (isSigningIn) return;
        setIsSigningIn(true);
        setLoading(true);
        try {
            const response = await doSignInWithEmailAndPassword(email, password, rememberMe) as any;
            if (response?.success) {
                if (!auth.currentUser?.emailVerified) {
                    setShowVerificationModal(true);
                } else {
                    await checkUserStatus(
                      setShowVerificationModal,
                      setShowRestrictedModal,
                      setShouldNavigate
                    );
                }
            }
        } catch (error) {
            code = (error as any).code;
            errorMsg = "";
            if (
                code === "auth/user-not-found" ||
                code === "auth/wrong-password"
            ) {
                errorMsg = "Invalid email or password. Please try again.";
            } else if (code === "auth/user-disabled") {
                errorMsg = "Access restricted: Your account is under review. Please contact the school administrator.";
            } else if (code === "auth/too-many-requests") {
                errorMsg = "Too many unsuccessful login attempts. Please try again later.";
            } else {
                errorMsg = `We couldn't find your account. Please check your email and password.`;
            }
            setErrorMessage(errorMsg);
        } finally {
            setIsSigningIn(false);
            setLoading(false);
        }
    }, [email, password, rememberMe, setLoading, isSigningIn, setShowVerificationModal, setShowRestrictedModal, setShouldNavigate, setErrorMessage]);

    // Function to handle Google sign-in
    const onGoogleSignIn = useCallback(async () => {
        if (!isSigningInWithGoogle) {
            setIsSigningInWithGoogle(true);
            setLoading(true);
            try {
                await doSignInWithGoogle(rememberMe);
            } catch (error) {
                code = (error as any).code;
                if (code === "auth/email-already-in-use") {
                    errorMsg = "The email address is already in use. Please use a different email.";
                } else if (code === "auth/operation-not-allowed") {
                    errorMsg = "Registration is currently disabled. Please contact support.";
                } else if (code === "auth/user-disabled") {
                    errorMsg = "Access restricted: Your account is under review. Please contact the school administrator.";
                } else {
                    errorMsg = "An error occurred while signing in with Google. Please try again.";
                }
                setErrorMessage(errorMsg);
            } finally {
                setIsSigningInWithGoogle(false);
                setLoading(false);
            }
        }
    }, [isSigningInWithGoogle]);

    // Function to handle Facebook sign-in
    const onFacebookSignIn = useCallback(async () => {
        if (!isSigningInWithFacebook) {
            setIsSigningInWithFacebook(true);
            setLoading(true);
            try {
                await doSignInWithFacebook();
            } catch (error) {
                code = (error as any).code;
                if (code === "auth/email-already-in-use") {
                    errorMsg = "The email address is already in use. Please use a different email.";
                } else if (code === "auth/operation-not-allowed") {
                    errorMsg = "Registration is currently disabled. Please contact support.";
                } else if (code === "auth/user-disabled") {
                    errorMsg = "Access restricted: Your account is under review. Please contact the school administrator.";
                } else {
                    errorMsg = "An error occurred while signing in with Google. Please try again.";
                }
                setErrorMessage(errorMsg);
            } finally {
                setIsSigningInWithFacebook(false);
                setLoading(false);
            }
        }
    }, [isSigningInWithFacebook]);

    const roleOptions = useMemo(() => [
        ...(userRole === "Admin" ? [{ value: "Admin", label: "Admin" }] : []),
        { value: "Teacher", label: "Teacher" },
        { value: "Student", label: "Student" },
    ], [userRole]);

    const gradeLevelOptions = useMemo(() => [
        { value: "Grade 1", label: "Grade 1" },
        { value: "Grade 2", label: "Grade 2" },
        { value: "Grade 3", label: "Grade 3" },
        { value: "Grade 4", label: "Grade 4" },
        { value: "Grade 5", label: "Grade 5" },
        { value: "Grade 6", label: "Grade 6" },
    ], []);

    const loadGradeLevelOptions = useCallback((inputValue: string, callback: (options: any[]) => void) => {
        setTimeout(() => {
            const filtered = gradeLevelOptions.filter(opt =>
                opt.label.toLowerCase().includes(inputValue.toLowerCase())
            );
            callback(filtered);
        }, 1000);
    }, [gradeLevelOptions]);

    const selectedGradeLevels = useMemo(() => {
        if (accountType === "Teacher" || accountType === "Admin" || role === "Teacher" || role === "Admin") {
            return gradeLevelOptions.filter(opt => multipleGradeLevels.includes(opt.value));
        } else if (accountType === "Student" || role === "Student") {
            return gradeLevelOptions.find(opt => opt.value === singleGradeLevel) || null;
        }
        return null;
    }, [accountType, role, multipleGradeLevels, singleGradeLevel, gradeLevelOptions]);

    const passwordRequirements = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
        /[@$!%*?&]/.test(password),
    ];
    const allPasswordValid = passwordRequirements.every(Boolean);

    const isLogin = searchParams.get("login") === "true";
    const isRegister = searchParams.get("register") === "true";
    const isForgot = searchParams.get("forgot") === "true";
    const isModalOpen = isLogin || isRegister || isForgot;

    const openLoginModal = useCallback(() => {
        setSearchParams({ login: "true" }, { replace: true });
        document.body.style.overflow = "hidden";
    }, [setSearchParams]);

    const openRegisterModal = useCallback(() => {
        setSearchParams({ register: "true" }, { replace: true });
        document.body.style.overflow = "hidden";
    }, [setSearchParams]);

    const resetState = useCallback(() => {
        setState({
            fullName: "",
            email: "",
            password: "",
            isPasswordFocused: false,
            accountType: "",
            role: "",
            singleGradeLevel: "",
            multipleGradeLevels: [],
            selectInputValue: "",
            isRegistering: false,
            isSigningIn: false,
            isSigningInWithGoogle: false,
            isSigningInWithFacebook: false,
            errorMessage: "",
            showPassword: false,
            rememberMe: true,
            showVerificationModal: false,
            showForgotPasswordModal: false,
            showRestrictedModal: false,
            shouldNavigate: false,
            isLoading: false,
            error: null,
        });
    }, []);

    const closeModal = useCallback(() => {
        resetState();
        setSearchParams({}, { replace: true });
        document.body.style.overflow = "auto";
    }, [resetState, setSearchParams]);

    return {
        state,
        fullName,
        email,
        password,
        isPasswordFocused,
        accountType,
        role,
        singleGradeLevel,
        multipleGradeLevels,
        selectInputValue,
        isRegistering,
        isSigningIn,
        isSigningInWithGoogle,
        isSigningInWithFacebook,
        errorMessage,
        showPassword,
        rememberMe,
        showVerificationModal,
        showForgotPasswordModal,
        showRestrictedModal,
        shouldNavigate,
        isLoading,
        error,
        updateState,
        setFullName,
        setEmail,
        setPassword,
        setShowPassword,
        setIsPasswordFocused,
        setAccountType,
        setRole,
        setSingleGradeLevel,
        setMultipleGradeLevels,
        setSelectInputValue,
        setIsRegistering,
        setRememberMe,
        setIsSigningIn,
        setIsSigningInWithGoogle,
        setIsSigningInWithFacebook,
        setShowVerificationModal,
        setShowForgotPasswordModal,
        setShowRestrictedModal,
        setShouldNavigate,
        setIsLoading,
        setErrorMessage,
        handleUserRegister,
        handleRegister,
        handleLogin,
        onGoogleSignIn,
        onFacebookSignIn,
        formattedGradeLevel,
        roleOptions,
        gradeLevelOptions,
        loadGradeLevelOptions,
        selectedGradeLevels,
        allPasswordValid,
        isLogin,
        isRegister,
        isForgot,
        isModalOpen,
        openLoginModal,
        openRegisterModal,
        closeModal,
        resetState,
    };
};