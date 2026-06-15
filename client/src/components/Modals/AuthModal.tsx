import { memo } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { useAuth } from "../../hooks/authContext";

interface AuthModalProps {
    isModalOpen: boolean;
    isLogin: boolean;
    isForgot: boolean;
    closeModal: () => void;
    openLoginModal: () => void;
    openRegisterModal: () => void;
}

const AuthModal = memo(({
    isModalOpen,
    isLogin,
    isForgot,
    closeModal,
    openLoginModal,
    openRegisterModal,
}: AuthModalProps) => {
    const { loadingDot } = useAuth();
    if (loadingDot || !isModalOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center">
            {isLogin || isForgot ? (
                <LoginModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSwitch={openRegisterModal}
                />
            ) : (
                <RegisterModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSwitch={openLoginModal}
                />
            )}
        </div>
    );
});

export default AuthModal;
