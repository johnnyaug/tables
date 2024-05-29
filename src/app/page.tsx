"use client";

import { DateTimeFormatter, LocalDate } from "@js-joda/core";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import GridLayout, { WidthProvider } from "react-grid-layout";
import { Toaster } from "react-hot-toast";
import FactTable from "./Facts";
import Summary from "./Summary";
import styles from "./page.module.css";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(GridLayout);
type Riddle = {
  id: number
}
const GameState = {
  IN_PROGRESS: "in_progress",
  SUCCESS: "success",
  FAILURE: "failure",
};

export default function Board() {

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [mistakesRemaining, setMistakesRemaining] = useLocalStorage(
    "mistakesRemaining",
    4
  );
  const [currentRiddleID, setCurrentRiddleID] = useLocalStorage(
    "currentRiddleID",
    0
  );
  const [riddle, setRiddle] = useState<Riddle>();
  const searchParams = useSearchParams();

  useEffect(() => {
    const today = DateTimeFormatter.ISO_LOCAL_DATE.format(LocalDate.now());
    fetch(`./riddles.json?dt=${today}`)
      .then((res) => res.json())
      .then((data) => {
        let dtKey = Object.keys(data).find((key) => key <= today);
        if (!dtKey) {
          dtKey = Object.keys(data)[0];
        }
        if (searchParams.has("preview")) {
          dtKey = Object.keys(data)[0];
        }
        const todayData = data[dtKey];
        setRiddle(todayData);
        if (currentRiddleID !== todayData.id) {
          // TODO
          setMistakesRemaining(4);
          setCurrentRiddleID(todayData.id);
        }
      });
  }, []);


  if (!riddle) {
    return;
  }
  const onClickSolve = () => {
    if (mistakesRemaining <= 0) {
      return;
    }
    // TODO
    let newGameState: string = GameState.IN_PROGRESS;
  };
 const gameState = GameState.IN_PROGRESS; // TODO

  return (
    <main className={styles.main}>
      <Toaster
        containerStyle={{
          bottom: "40px",
        }}
        toastOptions={{
          style: {
            backgroundColor: "black",
            color: "white",
          },
          position: "bottom-center",
          duration: 2000,
        }}
      />

      <FactTable
        className="layout"
        facts={[
          {
            name: "קלוריות",
            quantity: "200",
          },
          { name: "חלבונים", units: "ג׳", quantity: "5" },
        ]}
      />
      <div className="footer d-block">
        {gameState == GameState.IN_PROGRESS ? (
          <>
            <div className="panel">
              <input type="text"></input>
            </div>

            <div className="panel">
              <button onClick={onClickSolve}>שליחה</button>
              <button onClick={() => {}}>רמז</button>
            </div>
            <div className="panel">
              <div className="mistakes">טעויות נותרו: {mistakesRemaining}</div>
            </div>
          </>
        ) : (
          <>
            <div className="panel">
              <button onClick={() => setIsSummaryOpen(true)}>תוצאות</button>
            </div>
            <div className="panel" dir="rtl">
              <div className="h5">
                <div className="mb-2 mt-4">זמן עד החידה הבאה:</div>
                <Countdown
                  renderer={(r) =>
                    String(r.hours).padStart(2, "0") +
                    ":" +
                    String(r.minutes).padStart(2, "0") +
                    ":" +
                    String(r.seconds).padStart(2, "0")
                  }
                  date={new Date().setHours(23, 59, 59)}
                />
              </div>
            </div>
          </>
        )}
      </div>
      {!process.env.NODE_ENV ||
        (process.env.NODE_ENV === "development" && (
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            XXX
          </button>
        ))}
      <Summary
        puzzleNumber={riddle.id}
        isOpen={isSummaryOpen}
        isSuccess={true} // TODO
        onClose={() => setIsSummaryOpen(false)}
      />
    </main>
  );
}
