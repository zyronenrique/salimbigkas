
interface PasswordRequirementsProps {
    password: string;
    isPasswordFocused: boolean;
    allPasswordValid: boolean;
}

const PasswordRequirements = ({
    password,
    isPasswordFocused,
    allPasswordValid,
}: PasswordRequirementsProps) => {
    if (!isPasswordFocused || allPasswordValid) return null;

    return (
        <div className="absolute left-0 top-full mt-2 w-full z-50 bg-[#2C3E50] text-white py-3 px-4 rounded-lg shadow-lg border border-[#bcd0e6]">
            <ul className="text-sm text-left space-y-1">
                <li className="flex items-center gap-2">
                    <span
                        className={`inline-block w-2 h-2 rounded-full ${
                            password.length >= 8 ? "bg-green-500" : "bg-gray-300"
                        }`}
                    ></span>
                    <span>Password is at least 8 characters</span>
                </li>
                <li className="flex items-center gap-2">
                    <span
                        className={`inline-block w-2 h-2 rounded-full ${
                            /[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"
                        }`}
                    ></span>
                    <span>Contains an uppercase letter</span>
                </li>
                <li className="flex items-center gap-2">
                    <span
                        className={`inline-block w-2 h-2 rounded-full ${
                            /[a-z]/.test(password) ? "bg-green-500" : "bg-gray-300"
                        }`}
                    ></span>
                    <span>Contains a lowercase letter</span>
                </li>
                <li className="flex items-center gap-2">
                    <span
                        className={`inline-block w-2 h-2 rounded-full ${
                            /\d/.test(password) ? "bg-green-500" : "bg-gray-300"
                        }`}
                    ></span>
                    <span>Contains a number</span>
                </li>
                <li className="flex items-center gap-2">
                    <span
                        className={`inline-block w-2 h-2 rounded-full ${
                            /[@$!%*?&]/.test(password) ? "bg-green-500" : "bg-gray-300"
                        }`}
                    ></span>
                    <span>Contains a special character</span>
                </li>
            </ul>
        </div>
    );
};

export default PasswordRequirements;
