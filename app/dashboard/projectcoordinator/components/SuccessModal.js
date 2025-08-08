import Image from "next/image";
import { useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Modal from "react-modal";
import CopyIcon from "../../../assets/images/icons8-copy-90.png";

const SuccessModal = ({ isOpen, onRequestClose, email, password }) => {
  useEffect(() => {
    Modal.setAppElement(document.getElementById("__next"));
  }, []);

  <Modal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
    <div className="p-4">
      <h2>Profile Created Successfully</h2>
      <div className="mb-4">
        <p>
          Email: <strong>{email}</strong>
        </p>
        <p>
          Password: <strong>{password}</strong>
        </p>
      </div>

      <CopyToClipboard text={`${email} ${password}`}>
        <button className="bg-blue-500 text-white py-2 px-4 rounded mb-4">
          <Image src={CopyIcon} height={100} width={100} />
        </button>
      </CopyToClipboard>
      <div className="flex justify-end">
        <button
          onClick={onRequestClose}
          className="bg-gray-500 text-white py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  </Modal>;
};

export default SuccessModal;
