import CustomImage from "@/widgets/CustomImage";
import Link from "next/link";
import { Fragment, useMemo } from "react";

// ** Third Party Imports
import { useDropzone } from "react-dropzone";

// ** Styles
import { IoIosCloudUpload } from "react-icons/io";
import { LuUtensilsCrossed } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import { VscPreview } from "react-icons/vsc";

const SingleFileUploader = ({ files, setFieldValue, name, error, submitCount }: any) => {
  // ** State
  // const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [], // Accept all image types
    },
    // maxFiles: 6,
    multiple: false,
    onDrop: (acceptedFiles) => {
      // setFiles([...files, ...acceptedFiles.map((file) => Object.assign(file))]);
      setFieldValue(name, [...acceptedFiles.map((file) => Object.assign(file))]);
    },
  });

  const renderFilePreview = (file: any) => {
    if (file.type.startsWith("image")) {
      return (
        <div className="relative h-10 w-10">
          <CustomImage src={URL.createObjectURL(file)} />
        </div>
      );
    } else {
      return <VscPreview size="28" />;
    }
  };

  const handleRemoveFile = (file: any) => {
    const uploadedFiles = files;
    const filtered = uploadedFiles.filter((i: any) => i.name !== file.name);
    setFieldValue(name, [...filtered]);
  };

  const renderFileSize = (size: any) => {
    if (Math.round(size / 100) / 10 > 1000) {
      return `${(Math.round(size / 100) / 10000).toFixed(1)} mb`;
    } else {
      return `${(Math.round(size / 100) / 10).toFixed(1)} kb`;
    }
  };

  // Memoize the file previews
  const fileList = useMemo(() => {
    return files.map((file: any, index: any) => {
      const objectURL = URL.createObjectURL(file); // Create object URL

      return (
        <div
          key={`${file.name}-${index}`}
          className={`border-neutral mt-2 flex items-center justify-between rounded-md border px-5 py-1.5 ${submitCount > 0 && file.size / 1024 >= 250 ? "border-error" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <CustomImage src={objectURL} alt={file.name} />
            </div>
            <div>
              <p>{file.name}</p>
              <p>{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <button onClick={() => handleRemoveFile(file)} className="text-error">
            Remove
          </button>
        </div>
      );
    });
  }, [files, submitCount]); // Only re-compute the list when `files` changes

  const handleRemoveAllFiles = () => {
    setFieldValue(name, []);
  };

  return (
    <div className="cursor-pointer">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <div className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-5 ${error ? "border-error" : ""}`}>
          <IoIosCloudUpload size={64} />
          <h5 className="text-center">Drop Files here or click to upload</h5>
          <p className="text-center">
            Drop files here or click{" "}
            <Link href="/" onClick={(e: any) => e.preventDefault()} className="text-blue-500">
              browse
            </Link>{" "}
            thorough your machine
          </p>
        </div>
      </div>
      {error && <p className="text-error mt-1">{error}</p>}
      {files.length ? (
        <Fragment>
          <div className="my-2">{fileList}</div>
          <div className="flex justify-end">
            <button type="button" className="btn btn-outline btn-error" onClick={handleRemoveAllFiles}>
              Remove All
            </button>
            {/* <Button color="primary">Upload Files</Button> */}
          </div>
        </Fragment>
      ) : null}
    </div>
  );
};

export default SingleFileUploader;
