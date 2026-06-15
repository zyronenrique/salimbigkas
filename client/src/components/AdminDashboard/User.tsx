import { motion } from "framer-motion";
import { ChevronLeft, Eye, EyeClosed } from "lucide-react";
import { SpinLoadingWhite } from "../Icons/icons";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../Select/CustomSelect";
import { useUsersContext } from "../../hooks/usersContext";
import { useLogReg } from "../Modals/LogRegProvider";
import PasswordRequirements from "../Modals/PasswordRequirements";

const User = () => {
  const navigate = useNavigate();
  const { isEditingUser } = useUsersContext();
  const { 
    role,
    fullName,
    email,
    password,
    singleGradeLevel,
    multipleGradeLevels,
    selectInputValue,
    isRegistering,
    errorMessage,
    showPassword,
    isPasswordFocused,
    setRole,
    setFullName,
    setEmail,
    setPassword,
    setSingleGradeLevel,
    setMultipleGradeLevels,
    setSelectInputValue,
    setErrorMessage,
    setShowPassword,
    setIsPasswordFocused,
    handleUserRegister,
    allPasswordValid,
    roleOptions,
    gradeLevelOptions,
    selectedGradeLevels,
    loadGradeLevelOptions,
  } = useLogReg();

  return (
    <div className="overflow-hidden">
      <motion.div
        className="p-6 space-y-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center">
          <motion.button
            disabled={isRegistering}
            type="button"
            className="flex py-2 text-2xl hover:text-gray-600 font-bold items-center bg-none transition duration-200 ease-in-out"
            onClick={() => navigate(-1)}
            aria-label="back to users"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="mr-2" size={24} />
            <h1 className="tracking-tight">{isEditingUser ? "Edit user" : "Add user"}</h1>
          </motion.button>
        </div>
        {/* Users Table */}
        <div className="rounded-xl bg-white border-1 border-gray-200 shadow-sm p-8">
          {/* Error message display */}
          {errorMessage && (
            <motion.div
              className="relative flex mb-6 py-5 px-15 bg-[#FBE6E6] text-sm justify-center items-center rounded-sm shadow-sm drop-shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                className="w-5 h-5 absolute top-auto left-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="rgb(211, 0, 1)"
              >
                <path
                  d="M7.493 0.015 C 7.442 0.021,7.268 0.039,7.107 0.055 C 5.234 0.242,3.347 1.208,2.071 2.634 C 0.660 4.211,-0.057 6.168,0.009 8.253 C 0.124 11.854,2.599 14.903,6.110 15.771 C 8.169 16.280,10.433 15.917,12.227 14.791 C 14.017 13.666,15.270 11.933,15.771 9.887 C 15.943 9.186,15.983 8.829,15.983 8.000 C 15.983 7.171,15.943 6.814,15.771 6.113 C 14.979 2.878,12.315 0.498,9.000 0.064 C 8.716 0.027,7.683 -0.006,7.493 0.015 M8.853 1.563 C 9.967 1.707,11.010 2.136,11.944 2.834 C 12.273 3.080,12.920 3.727,13.166 4.056 C 13.727 4.807,14.142 5.690,14.330 6.535 C 14.544 7.500,14.544 8.500,14.330 9.465 C 13.916 11.326,12.605 12.978,10.867 13.828 C 10.239 14.135,9.591 14.336,8.880 14.444 C 8.456 14.509,7.544 14.509,7.120 14.444 C 5.172 14.148,3.528 13.085,2.493 11.451 C 2.279 11.114,1.999 10.526,1.859 10.119 C 1.618 9.422,1.514 8.781,1.514 8.000 C 1.514 6.961,1.715 6.075,2.160 5.160 C 2.500 4.462,2.846 3.980,3.413 3.413 C 3.980 2.846,4.462 2.500,5.160 2.160 C 6.313 1.599,7.567 1.397,8.853 1.563 M7.706 4.290 C 7.482 4.363,7.355 4.491,7.293 4.705 C 7.257 4.827,7.253 5.106,7.259 6.816 C 7.267 8.786,7.267 8.787,7.325 8.896 C 7.398 9.033,7.538 9.157,7.671 9.204 C 7.803 9.250,8.197 9.250,8.329 9.204 C 8.462 9.157,8.602 9.033,8.675 8.896 C 8.733 8.787,8.733 8.786,8.741 6.816 C 8.749 4.664,8.749 4.662,8.596 4.481 C 8.472 4.333,8.339 4.284,8.040 4.276 C 7.893 4.272,7.743 4.278,7.706 4.290 M7.786 10.530 C 7.597 10.592,7.410 10.753,7.319 10.932 C 7.249 11.072,7.237 11.325,7.294 11.495 C 7.388 11.780,7.697 12.000,8.000 12.000 C 8.303 12.000,8.612 11.780,8.706 11.495 C 8.763 11.325,8.751 11.072,8.681 10.932 C 8.616 10.804,8.460 10.646,8.333 10.580 C 8.217 10.520,7.904 10.491,7.786 10.530 "
                  stroke="none"
                />
              </svg>
              <p>{errorMessage}</p>
            </motion.div>
          )}
          {/* Registration form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUserRegister();
          }}>
            <div className="flex text-left mb-5 justify-between items-center">
              <h3 className="text-sm text-gray-600 mb-4">
                Please fill in the details below to register a new user.
              </h3>
              {/* Register button */}
              <motion.button
                type="submit"
                title="Register new user"
                disabled={isRegistering}
                className={`bg-[#2C3E50] text-lg text-white px-20 py-3 rounded-lg shadow-md drop-shadow-lg ${isRegistering ? "opacity-50 cursor-not-allowed" : "hover:font-medium hover:border-[#386BF6] hover:bg-[#34495e]"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRegistering ? (
                  <div className="flex items-center justify-center gap-2">
                    <SpinLoadingWhite size={6}/>
                    Processing...
                  </div>
                ) : (
                  isEditingUser ? "Save" : "Register"
                )}
              </motion.button>
            </div>
            <div className="grid md:grid-cols-1 gap-4">
              {/* Full Name input */}
              <div className="mt-2 mb-2 text-left relative">
                <input
                  disabled={isRegistering}
                  name="fullname"
                  type="text"
                  id="fullname"
                  autoComplete="name"
                  required
                  autoFocus
                  minLength={1}
                  maxLength={30}
                  className={`w-full font-bold p-4 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${fullName ? "border-[#2C3E50]" : "border-gray-300"}`}
                  placeholder=" "
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  // Restrict input to letters and spaces only
                  onKeyDown={(e) => {
                    setErrorMessage("");
                    if (
                      !/^[a-zA-Z\s]*$/.test(e.key) &&
                      e.key !== "Backspace" &&
                      e.key !== "Delete"
                    ) {
                      e.preventDefault();
                      setErrorMessage(
                        "Please enter a valid name. Only letters and spaces are allowed.",
                      );
                      return;
                    }
                  }}
                />
                <label
                  className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${fullName ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                  htmlFor="fullname"
                >
                  Full Name
                </label>
              </div>
              {/* Email input */}
              <div className="mt-2 mb-2 text-left relative">
                <input
                  disabled={isRegistering}
                  name="email"
                  type="email"
                  id="email"
                  autoComplete="email"
                  required
                  minLength={1}
                  maxLength={30}
                  className={`w-full font-bold p-4 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${email ? "border-[#2C3E50]" : "border-gray-300"}`}
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={() => {
                    setErrorMessage("");
                  }}
                />
                <label
                  className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${email ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                  htmlFor="email"
                >
                  Email
                </label>
              </div>
              {/* Password input */}
              <div className="mt-2 mb-2 text-left relative">
                <motion.input
                  disabled={isRegistering}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  required={!isEditingUser}
                  minLength={8}
                  maxLength={20}
                  className={`w-full font-bold p-4 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${password ? "border-[#2C3E50]" : "border-gray-300"}`}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  onKeyDown={() => {
                    setErrorMessage("");
                  }}
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  className="absolute right-4 top-4.5 border-none bg-transparent cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye
                      size={24}
                      color={`${password ? "#2C3E50" : "oklch(87.2% 0.01 258.338)"}`}
                    />
                  ) : (
                    <EyeClosed
                      size={24}
                      color={`${password ? "#2C3E50" : "oklch(87.2% 0.01 258.338)"}`}
                    />
                  )}
                </button>
                <label
                  htmlFor="password"
                  className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${password ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                >
                  Password
                </label>
                {/* Password requirements */}
                <PasswordRequirements
                  password={password}
                  isPasswordFocused={isPasswordFocused}
                  allPasswordValid={allPasswordValid}
                />
              </div>
              {/* Role selection */}
              <div className="mt-2 text-left relative">
                <CustomSelect
                  isDisabled={isRegistering}
                  required
                  isClearable
                  options={roleOptions}
                  value={roleOptions.find((opt) => opt.value === role) || null}
                  onChange={(selected: any) => setRole(selected ? selected.value : "")}
                  placeholder=" "
                  styles={{
                    control: (base: any, state: any) => ({
                      ...base,
                      minHeight: "58px",
                      padding: "8px",
                      borderColor: role ? "#2C3E50" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 2px #2C3E50" : base.boxShadow,
                      "&:hover": { borderColor: "#2C3E50" },
                      backgroundColor: "#fff",
                    }),
                    singleValue: (base: any) => ({
                      ...base,
                      color: "#2C3E50",
                      fontWeight: "bold",
                    }),
                    option: (base: any, state: any) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#2C3E50"
                        : state.isFocused
                        ? "#34495e"
                        : "#2C3E50",
                      color: "#fff",
                      fontWeight: state.isSelected ? "bold" : "normal",
                      padding: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }),
                    menu: (base: any) => ({
                      ...base,
                      backgroundColor: "#2C3E50",
                    }),
                    menuPortal: (base: any) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    clearIndicator: (base: any) => ({
                      ...base,
                      color: "#2C3E50",
                      ':hover': {
                        color: "#e0f2f1",
                      },
                    }),
                    dropdownIndicator: (base: any) => ({
                      ...base,
                      color: "#2C3E50",
                      ':hover': {
                        color: "#e0f2f1",
                      },
                    }),
                  }}
                  menuPortalTarget={document.body}
                />
                <label
                  className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${
                    role ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"
                  }`}
                  htmlFor="role"
                >
                  Choose your role
                </label>
              </div>
              {(role === "Student" || role === "Teacher" || role === "Admin") && (
                <div className="mt-2 text-left relative">
                  <CustomSelect
                    isMulti={role === "Teacher" || role === "Admin"}
                    closeMenuOnSelect={role === "Student"}
                    isDisabled={isRegistering}
                    required
                    isClearable
                    loadOptions={loadGradeLevelOptions}
                    defaultOptions={gradeLevelOptions}
                    value={selectedGradeLevels}
                    onChange={(selected: any) => {
                      if (role === "Teacher" || role === "Admin") {
                        setMultipleGradeLevels(selected ? selected.map((opt: any) => opt.value) : []);
                      } else {
                        setSingleGradeLevel(selected ? selected.value : "");
                      }
                    }}
                    onInputChange={(inputValue: string) => setSelectInputValue(inputValue)}
                    inputValue={selectInputValue}
                    placeholder=" "
                    noOptionsMessage={() => "No grade levels found"}
                    styles={{
                      control: (base: any, state: any) => ({
                        ...base,
                        minHeight: "58px",
                        padding: "8px",
                        borderColor:
                          (role === "Teacher" || role === "Admin"
                            ? multipleGradeLevels.length > 0
                            : !!singleGradeLevel)
                            ? "#2C3E50"
                            : "#d1d5db",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px #2C3E50"
                          : base.boxShadow,
                        "&:hover": { borderColor: "#2C3E50" },
                        backgroundColor: "#fff",
                      }),
                      loadingMessage: (base: any) => ({
                        ...base,
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        backgroundColor: "#2C3E50",
                        padding: "12px",
                      }),
                      noOptionsMessage: (base: any) => ({
                        ...base,
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        backgroundColor: "#2C3E50",
                        padding: "12px",
                      }),
                      input: (base: any) => ({
                        ...base,
                        color: "#2C3E50",
                        margin: 5,
                      }),
                      option: (base: any, state: any) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#2C3E50"
                          : state.isFocused
                          ? "#34495e"
                          : "#2C3E50",
                        color: "#fff",
                        fontWeight: state.isSelected ? "bold" : "normal",
                        padding: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }),
                      menu: (base: any) => ({
                        ...base,
                        backgroundColor: "#2C3E50",
                      }),
                      menuPortal: (base: any) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      singleValue: (base: any) => ({
                        ...base,
                        color: "#2C3E50",
                        fontWeight: "bold",
                      }),
                      multiValue: (base: any) => ({
                        ...base,
                        width: "max-content",
                        fontWeight: "bold",
                        borderRadius: 5,
                        backgroundColor: "#eaf0fa",
                        color: "#2C3E50",
                      }),
                      multiValueLabel: (base: any) => ({
                        ...base,
                        color: "#2C3E50",
                      }),
                      multiValueRemove: (base: any) => ({
                        ...base,
                        color: "#2C3E50",
                        ":hover": { backgroundColor: "#2C3E50", color: "#fff" },
                      }),
                      clearIndicator: (base: any) => ({
                        ...base,
                        color: "#2C3E50",
                        ':hover': {
                          color: "#e0f2f1",
                        },
                      }),
                      dropdownIndicator: (base: any) => ({
                        ...base,
                        color: "#2C3E50",
                        ':hover': {
                          color: "#e0f2f1",
                        },
                      }),
                      loadingIndicator: (base: any) => ({
                        ...base,
                        color: "#2C3E50",
                      }),
                    }}
                    menuPortalTarget={document.body}
                  />
                  <label
                    className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${
                      (role === "Teacher" || role === "Admin"
                        ? multipleGradeLevels.length > 0
                        : singleGradeLevel) || selectInputValue
                        ? "bg-white top-[-10px] text-[#2C3E50] text-sm"
                        : "top-4 text-gray-500 text-base"
                    }`}
                    htmlFor="gradelevel"
                  >
                    {role === "Teacher" || role === "Admin"
                      ? "What grade levels do you teach?"
                      : "What is your grade level?"}
                  </label>
                </div>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default User;
