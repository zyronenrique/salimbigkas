import { motion } from "framer-motion";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { imageSrc } from "../Icons/icons";
import { SpinLoadingWhite } from "../Icons/icons";
import { useClassesState } from "./useClassesState";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../Select/CustomSelect";

const AddMember = () => {
  const navigate = useNavigate();
  const { state, updateState, groupedUsers, loadOptions, handleRegister } = useClassesState();

  return (
    <div className="overflow-hidden h-[calc(100vh-65px)]">
      <motion.div
        className="p-6 space-y-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center">
          <motion.button
            type="button"
            className="flex py-2 text-2xl hover:text-gray-600 font-bold items-center bg-none transition duration-200 ease-in-out"
            onClick={() => navigate(-1)}
            aria-label="back to classes"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="mr-2" size={24} />
            <h1 className="tracking-tight">Add member</h1>
          </motion.button>
        </div>

        <div className="rounded-xl bg-white border-1 border-gray-200 shadow-sm p-8">
          {/* Error message display */}
          {state.error && (
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
              <p>{state.error}</p>
            </motion.div>
          )}
          {/* Registration form */}
          <form onSubmit={async(e)=> {
            e.preventDefault();
            await handleRegister();
          }}>
            <div className="flex text-left mb-5 gap-4 justify-between items-center">
              <h3 className="text-base text-gray-600 mb-4">
                To add a member, start typing a name or email.
              </h3>
              <div className="flex gap-5 items-center">
                {/* Register button */}
                <button
                  type="submit"
                  className={`bg-[#2C3E50] text-lg text-white px-15 py-3 rounded-lg shadow-md drop-shadow-lg ${state.isRegistering ? "opacity-50 cursor-not-allowed" : "hover:font-medium hover:border-[#386BF6] hover:bg-[#34495e]"}`}
                  disabled={state.isRegistering}
                >
                  {state.isRegistering ? (
                    <div className="flex items-center justify-center gap-2">
                      <SpinLoadingWhite size={6}/>
                      Processing...
                    </div>
                  ) : (
                    "Register"
                  )}
                </button>
              </div>
            </div>
            <div className="mt-2 mb-2 text-left relative min-w-[180px]">
              <label
                className={`absolute z-10 left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 text-lg font-medium px-1
                  ${state.selectedUsers.length > 0 || state.selectInputValue ? "bg-white top-[-1px] text-[#2C3E50] text-sm" : "top-1/2 text-gray-500 text-base"}
                `}
                htmlFor="addmember"
              >
                Type a name or email
              </label>
              <CustomSelect
                inputId="addmember"
                isMulti
                isDisabled={state.isRegistering}
                required
                name="addmember"
                loadOptions={loadOptions}
                defaultOptions={groupedUsers}
                value={groupedUsers.flatMap(group => group.options).filter((opt) =>
                  state.selectedUsers.includes(opt.value)
                )}
                onChange={(opts: any) =>
                  updateState({
                    selectedUsers: Array.isArray(opts) ? opts.map((opt: any) => opt.value) : [],
                  })
                }
                onInputChange={(value: string) => updateState({ selectInputValue: value })}
                inputValue={state.selectInputValue}
                placeholder=" "
                formatOptionLabel={(opt: any) => (
                  <div className="flex items-center justify-between p-1 gap-2">
                    <img
                      loading="lazy"
                      src={imageSrc.man}
                      alt="Photo"
                      className="w-10 h-10 rounded-full mr-2 object-cover"
                    />
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-start">
                        <label className="font-bold">
                          {opt.label}
                        </label>
                        {opt.gradeLevel && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                            {opt.gradeLevel}
                          </span>
                        )}
                        {opt.gradeLevels && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                            Have multiple grade levels
                          </span>
                        )}
                      </div>
                      <span className="text-sm">{opt.email}</span>
                    </div>
                  </div>
                )}
                noOptionsMessage={() => "No users found"}
                styles={{
                  control: (base: any, state: any) => ({
                    ...base,
                    minHeight: "58px",
                    padding: "8px 0",
                    borderColor:
                      state.selectedUsers?.length > 0 ? "#2C3E50" : "#d1d5db",
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
                  groupHeading: (base: any) => ({
                    ...base,
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }),
                  menu: (base: any) => ({
                    ...base,
                    backgroundColor: "#2C3E50",
                    zIndex: 20,
                  }),
                  multiValue: (base: any) => ({
                    ...base,
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
                  loadingIndicator: (base: any) => ({
                    ...base,
                    color: "#2C3E50",
                  }),
                }}
                menuPortalTarget={document.body}
              />
            </div>
            {/* Role selection */}
            <div className="mt-4 mb-2 text-left relative">
              <div className="relative">
                <select
                  disabled={state.isRegistering}
                  name="role"
                  id="role"
                  required
                  className={`w-full p-4 pr-12 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none appearance-none ${state.title ? "border-[#2C3E50]" : "border-gray-300"}`}
                  value={state.title}
                  onChange={(e) => updateState({ title: e.target.value })}
                >
                  <option value=""></option>
                  <option value="Member">Member</option>
                  <option value="Owner">Owner</option>
                </select>
                {/* Custom arrow */}
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <ChevronDown size={20} />
                </span>
                <label
                  className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${state.title ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                  htmlFor="role"
                >
                  Select role
                </label>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddMember;
