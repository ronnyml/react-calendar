import React from "react";
import { DeleteConfirmationProps } from "../interfaces/DeleteConfirmation";

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  confirmDelete,
  cancelDelete,
}) => {
  return (
    <div className="reminder-popup">
      <div className="delete-confirmation">
        <button className="close-button" onClick={cancelDelete}>
          X
        </button>
        <h3>Are you sure you want to delete this?</h3>
        <div className="confirmation-actions">
          <button className="confirm-button" onClick={confirmDelete}>
            Yes
          </button>
          <button className="cancel-button" onClick={cancelDelete}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
