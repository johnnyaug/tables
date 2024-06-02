"use client";

import { Database, Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { Toaster } from "react-hot-toast";
import FactTable, { FactItem } from "./Facts";
import Summary from "./Summary";
import styles from "./page.module.css";

const MAX_ATTEMPTS = 3;

type Solved = {
  attempts: number;
};

type Riddle = {
  id: number;
  solution: string;
};
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

const GameState = {
  IN_PROGRESS: "in_progress",
  SUCCESS: "success",
  FAILURE: "failure",
};

export default function Board() {
  useEffect(() => {
    (async () => {
      const sqlite3InitModule = (await import("@sqlite.org/sqlite-wasm"))
        .default;
      const sqlite3 = await sqlite3InitModule({
        print: log,
        printErr: error,
      });
      setDB(await initDB(sqlite3));
    })();
  }, []);
  const [db, setDB] = useState<Database>();

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [attempt, setAttempt] = useLocalStorage("attempt", 1);
  const [currentRiddleID, setCurrentRiddleID] = useLocalStorage(
    "currentRiddleID",
    0
  );
  const [solved, setSolved] = useState<Solved>();
  const [riddle, setRiddle] = useState<Riddle>();
  const [facts, setFacts] = useState<FactItem[]>([]);
  const [userSolution, setUserSolution] = useState<String>("");
  // const searchParams = useSearchParams();
  useEffect(() => {
    if (!db) {
      return;
    }
    const r: Riddle = db.selectObject(`SELECT * FROM riddles`) as Riddle;
    setRiddle(r);
    const facts: FactItem[] = db.selectObjects(
      `SELECT * FROM facts WHERE riddle_id=? ORDER BY \`order\``,
      r.id
    ) as FactItem[];
    setFacts(facts);
  }, [db]);
  if (!db || !riddle) {
    return;
  }
  const onClickSolve = () => {
    if (attempt > MAX_ATTEMPTS) {
      return;
    }
    const newAttempt = attempt + 1;
    setAttempt(newAttempt);
    if (userSolution === riddle.solution) {
      setSolved({ attempts: newAttempt });
      setIsSummaryOpen(true);
    } else if (newAttempt > MAX_ATTEMPTS) {
      setIsSummaryOpen(true);
    }
    
  };
  let gameState = GameState.IN_PROGRESS;
  if (solved) {
    gameState = GameState.SUCCESS;
  } else if (attempt > MAX_ATTEMPTS) {
    gameState = GameState.FAILURE;
  }

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

      <FactTable className="layout" facts={facts} />
      <div className="footer d-block">
        {gameState == GameState.IN_PROGRESS ? (
          <>
            <div className="panel" dir="rtl">
              <input type="text" placeholder="ניחוש" onChange={(e) => setUserSolution(e.target.value)}></input>
            </div>

            <div className="panel">
              <button onClick={onClickSolve} disabled={!Boolean(userSolution)}>שליחה</button>
              <button onClick={() => {}} disabled={true}>רמז</button>
            </div>
            <div className="panel">
              <div className="mistakes">
                טעויות נותרו: {MAX_ATTEMPTS + 1 - attempt}
              </div>
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
        isSuccess={gameState === GameState.SUCCESS}
        onClose={() => setIsSummaryOpen(false)}
      />
    </main>
  );
}
