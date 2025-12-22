import { MdEmail } from "react-icons/md";
import { IoReturnDownBackOutline } from "react-icons/io5";

const ForgotPassword: React.FC<any> = ({ open, setOpen, setLogin }) => {
  return (
    // Conditional class to open/close the modal based on `open` prop
    <dialog id="forgot-password" className={`modal ${open ? "modal-open" : ""}`}>
      <div className="modal-box">
        <form method="dialog">
          {/* Close button for the modal */}
          <button className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2" type="button" onClick={() => setOpen(false)}>
            ✕
          </button>

          {/* Modal title and description */}
          <h4 className="text-center capitalize">Forgot Password</h4>
          <p className="mt-1 text-center text-slate-500">{`No worries, we'll send you reset instructions.`}</p>

          {/* Link to go back to login */}
          <div className="flex items-center justify-center gap-3">
            <IoReturnDownBackOutline className="text-slate-500" />
            <p className="mt-1 text-center text-slate-500">
              Go back to{" "}
              <span
                className="text-primary cursor-pointer underline"
                onClick={() => {
                  setOpen(false);
                  setLogin(true);
                }}
              >
                Login
              </span>
            </p>
          </div>

          {/* Email input field */}
          <div className="mt-4">
            <label className="input input-bordered mb-5 flex items-center gap-2">
              <MdEmail className="text-[16px] text-slate-500" />
              <input type="text" className="grow" placeholder="Email" />
            </label>
          </div>

          {/* Submit button */}
          <div className="mt-5 flex justify-center">
            <button className="btn btn-primary">Reset Password</button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default ForgotPassword;
