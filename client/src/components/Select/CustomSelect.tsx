import Select from "react-select";
import AsyncSelect from "react-select/async";
import makeAnimated from "react-select/animated";
import chroma from "chroma-js";

type OptionType = {
  value: string;
  label: string;
  color?: string;
  [key: string]: any;
};

type GroupedOptionType = {
  label: string;
  options: OptionType[];
};

interface CustomSelectProps {
  isMulti?: boolean;
  closeMenuOnSelect?: boolean;
  loadOptions?: (inputValue: string, callback: (options: OptionType[] | GroupedOptionType[]) => void) => void;
  options?: OptionType[] | GroupedOptionType[];
  value?: OptionType | OptionType[] | null;
  onChange?: (value: any) => void;
  placeholder?: string;
  defaultOptions?: OptionType[] | GroupedOptionType[];
  isLoading?: boolean;
  isDisabled?: boolean;
  styles?: any;
  components?: any;
  [key: string]: any;
}

const animatedComponents = makeAnimated();

const defaultStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "transparent",
    borderColor: "transparent",
    minWidth: 140,
    minHeight: 48,
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1.1rem",
    "&:hover": {
      borderColor: "transparent",
      boxShadow: "none",
    },
    "&:focus": {
      borderColor: "transparent",
      boxShadow: "none",
    },
    "&:active": {
      borderColor: "transparent",
      boxShadow: "none",
    },
  }),
  groupHeading: (provided: any) => ({
    ...provided,
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1rem",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#8a3903" // selected: brown
      : state.isFocused
      ? "#8a3903" // focused: green
      : "#18411b",
    color: "#fff",
    fontWeight: state.isSelected ? "bold" : "normal",
    padding: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: chroma("#8a3903").alpha(0.5).css(),
    color: "#fff",
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "#fff",
    fontWeight: "bold",
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: "#fff",
    backgroundColor: "#8a3903",
    ":hover": {
      backgroundColor: "#003311",
      color: "#fff",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#2C3E50",
    zIndex: 20,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#fff",
    fontWeight: "bold",
  }),
  loadingIndicator: (provided: any) => ({
    ...provided,
    color: "#fff",
  }),
};

const CustomSelect = ({
  isMulti = false,
  closeMenuOnSelect = !isMulti,
  loadOptions,
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  defaultOptions,
  isLoading,
  isDisabled,
  styles,
  components: customComponents,
  ...rest
}: CustomSelectProps) => {
  const SelectComponent = loadOptions ? AsyncSelect : Select;

  return (
    <SelectComponent
      isDisabled={isDisabled}
      isMulti={isMulti}
      closeMenuOnSelect={closeMenuOnSelect}
      menuPlacement="auto"
      cacheOptions
      defaultOptions={defaultOptions}
      loadOptions={loadOptions}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isLoading={isLoading}
      components={customComponents || animatedComponents}
      styles={styles || defaultStyles}
      theme={(theme: any) => ({
        ...theme,
        borderRadius: 8,
        colors: {
          ...theme.colors,
          primary25: "#003311",
          primary: "#8a3903",
          neutral0: "#222e23",
          neutral80: "#fff",
        },
      })}
      {...rest}
    />
  );
};

export default CustomSelect;