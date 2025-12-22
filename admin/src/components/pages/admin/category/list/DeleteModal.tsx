import Spinner from "@/widgets/Spinner";
import React from "react";
import { MdDeleteForever } from "react-icons/md";

const DeleteModal = ({ open, setOpen, onClick, isDeleteLoading }: any) => {
  return (
    <div>
      <dialog id="delete-pubg-product" className={`modal ${open ? "modal-open" : "modal-close"}`}>
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2" onClick={() => setOpen(false)}>
              ✕
            </button>
          </form>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            Delete <MdDeleteForever className="cursor-pointer text-red-500" size={25} />
          </h3>
          <p className="py-4">Are you sure you want to delete the category?</p>

          <div className="mt-7 flex justify-end">
            <div className="flex gap-3">
              <button type="button" className="btn btn-error btn-sm" onClick={() => setOpen(false)}>
                No
              </button>
              <button type="button" className="btn btn-primary btn-sm" disabled={isDeleteLoading} onClick={onClick}>
                Yes {isDeleteLoading ? <Spinner colorClass="!text-netural" /> : ""}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default DeleteModal;
