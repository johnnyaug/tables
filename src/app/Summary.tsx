import toast from "react-hot-toast";
import Modal from "react-modal";

interface SummaryProps {
  isOpen: boolean;
  onClose: () => void;
  isSuccess: boolean;
  puzzleNumber: number;
}

export default function Summary({
  isOpen,
  isSuccess,
  onClose,
  puzzleNumber,
}: SummaryProps) {
  const summaryStyles = {
    content: {
      top: "20%",
      maxWidth: "450px",
      maxHeight: "550px",
      margin: "auto",
      textAlign: "center",
      border: 0,
      direction: "rtl",
      filter: "drop-shadow(0 0 0.75rem grey)",
      animation: "fadeIn 1s",
    },
    overlay: {
      backgroundColor: "rgba(255, 255, 255, 0.75)",
    },
  };
  const title = isSuccess ? "כל הכבוד!" : "אולי בפעם הבאה";
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      // @ts-ignore
      style={summaryStyles}
    >
      <div className="close-button" onClick={onClose}>
        <span aria-hidden="true">&times;</span>
      </div>
      <h1 className="mt-4">{title}</h1>
      <div className="container guess-chart mt-5">סיכוםםם</div>
      <div className="panel mt-5">
        <button
          onClick={async () => {
            await navigator.clipboard
              .writeText(`טייבל #${puzzleNumber} רוצה לנסות גם?
https://<TBD>/`);
            toast("הועתק");
          }}
        >
          שיתוף
        </button>
      </div>
    </Modal>
  );
}

Modal.setAppElement('body');
