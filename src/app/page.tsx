"use client";

import { Database, SqlValue, Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import GridLayout, { WidthProvider } from "react-grid-layout";
import { Toaster } from "react-hot-toast";
import FactTable, { FactItem } from "./Facts";
import Summary from "./Summary";
import styles from "./page.module.css";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";

const log = console.log;
const error = console.error;

const initDB = async (sqlite3: Sqlite3Static) => {
  log("Running SQLite3 version", sqlite3.version.libVersion);
  const resp = await fetch("./riddles.db");
  const arrayBuffer = await resp.arrayBuffer();
  const db = new sqlite3.oo1.DB();  
  const rc = sqlite3.capi.sqlite3_deserialize(
    db,
    "main",
    sqlite3.wasm.allocFromTypedArray(arrayBuffer),
    arrayBuffer.byteLength,
    arrayBuffer.byteLength,
    sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
  );
  db.checkRc(rc);
  return db;
};


const ResponsiveGridLayout = WidthProvider(GridLayout);
type Riddle = {
  id: number;
};
const GameState = {
  IN_PROGRESS: "in_progress",
  SUCCESS: "success",
  FAILURE: "failure",
};

export default function Board() {
  useEffect(() => {
    (async () => {
      const sqlite3InitModule = (await import("@sqlite.org/sqlite-wasm")).default;
      const sqlite3 = await sqlite3InitModule({
        print: log,
        printErr: error,
      });
      setDB(await initDB(sqlite3));
    })();
    
  }, [])
  const [db, setDB] = useState<Database>();

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
  const [facts, setFacts] = useState<FactItem[]>([]);
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!db) {
      return;
    }
    const r : Riddle = db.selectObject(`SELECT * FROM riddles`) as Riddle;
      setRiddle({
      id: r.id,
    });
    const facts : FactItem[] = db.selectObjects(`SELECT * FROM facts WHERE riddle_id=? ORDER BY \`order\``, r.id) as FactItem[];
    setFacts(facts);
    
  }, [db]);
  if (!db || !riddle) {
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
        facts={facts}
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
