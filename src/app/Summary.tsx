import toast from "react-hot-toast";
import Modal from "react-modal";
import { Riddle } from "./page";

interface SummaryProps {
  isOpen: boolean;
  onClose: () => void;
  isSuccess: boolean;
  riddle: Riddle;
}

export default function Summary({
  isOpen,
  isSuccess,
  onClose,
  riddle,
}: SummaryProps) {
  const summaryStyles = {
    content: {
      top: "10%",
      maxWidth: "450px",
      maxHeight: "100vh",
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
        scroll={false}
      isOpen={isOpen}
      onRequestClose={onClose}
      // @ts-ignore
      style={summaryStyles}
    >
      <div className="summary">
        <div className="close-button" onClick={onClose}>
          <span aria-hidden="true">&times;</span>
        </div>
        <h1 className="mt-4">{title}</h1>
        <div className="container guess-chart mt-2">{riddle.product_name}</div>
        <img src={riddle.photo} />
        <div className="panel mt-2">
          <button
            onClick={async () => {
              await navigator.clipboard
                .writeText(`טייבלס #${riddle.id}: אני לא הצלחתי הפעם. רוצה לנסות גם?
https://<TBD>/`);
              toast("הועתק");
            }}
          >
            שיתוף
          </button>
        </div>
      </div>
    </Modal>
  );
}

Modal.setAppElement("body");
