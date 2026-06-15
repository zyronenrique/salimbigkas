import { useRef, useState, ChangeEvent } from "react";
import { X } from "lucide-react";
import { compressPdfFile } from "../../utils/helpers";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type FileInputProps = {
  label: string;
  files: File[];
  setFiles: (files: File[]) => void;
  disabled: boolean;
  inputId: string;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
};

const FileInput = ({
  label,
  files,
  setFiles,
  disabled,
  inputId,
  multiple = false,
  accept = ".pdf",
  maxFiles = 1,
}: FileInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    const newFiles = Array.from(e.target.files || []);
    const processedFiles: File[] = [];
    for (const file of newFiles) {
      let processedFile = file;
      if (file.type === "application/pdf") {
        processedFile = await compressPdfFile(file);
      }
      if (processedFile.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(
          `Each file must be less than ${MAX_FILE_SIZE_MB} MB after compression.`
        );
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      processedFiles.push(processedFile);
    }
    if (multiple) {
      if (processedFiles.length + files.length > maxFiles) {
        setErrorMessage(`You can only upload up to ${maxFiles} files.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setFiles([...files, ...processedFiles]);
    } else {
      if (processedFiles.length !== 1) {
        setErrorMessage("You can only upload one file.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setFiles([processedFiles[0]]);
    }
    if (fileInputRef?.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
    if (fileInputRef?.current) fileInputRef.current.value = "";
  };

  return (
    <div className="text-left relative mb-2">
      <input
        ref={fileInputRef}
        disabled={disabled}
        type="file"
        id={inputId}
        name={inputId}
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      <label
        htmlFor={inputId}
        className={`block w-full border rounded-sm cursor-pointer transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${files.length > 0 ? "border-[#2C3E50] p-2" : "border-gray-300 p-4"} bg-white flex items-center`}
        tabIndex={0}
        onKeyDown={(e) => {
          e.preventDefault();
          if (e.key === "Enter" || e.key === " ") {
            document.getElementById(inputId)?.click();
          }
        }}
      >
        {files.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {files.map((file, idx) => (
              <span
                key={idx}
                className="flex items-stretch rounded bg-[#2C3E50] border border-[#b3c6e7] text-white text-sm font-medium shadow-sm"
              >
                <span className="flex items-center gap-1 p-4">
                  <span className="truncate max-w-[120px]" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-gray-300 text-xs">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </span>
                <button
                  type="button"
                  title="Tanggalin ang file"
                  className="flex self-stretch items-center p-2 bg-red-500/90 text-xs text-white font-semibold hover:bg-red-600 focus:ring-2 focus:ring-red-300 transition-all border border-red-400 shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(idx);
                  }}
                  aria-label={`Tanggalin ang ${file.name}`}
                  tabIndex={-1}
                >
                  <X className="inline" size={14} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">{label}</span>
        )}
      </label>
      {errorMessage && (
        <div className="text-red-600 text-sm mt-2">{errorMessage}</div>
      )}
    </div>
  );
};

export default FileInput;
