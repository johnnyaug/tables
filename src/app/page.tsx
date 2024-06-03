"use client";

import { Database, Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { Toaster } from "react-hot-toast";
import FactTable, { FactItem } from "./Facts";
import Summary from "./Summary";
import styles from "./page.module.css";
import Clues, { Clue } from "./Clues";

const MAX_ATTEMPTS = 3;

type Solved = {
  attempts: number;
};

export type Riddle = {
  id: number;
  solution: string;
  product_name: string;
  photo: string;
  facts: FactItem[];
  clues: Clue[];
};

const log = console.log;
const error = console.error;

const initDB = async (sqlite3: Sqlite3Static) => {
  log("Running SQLite3 version", sqlite3.version.libVersion);
  const resp = await fetch(`./riddles.db?break=${new Date().toISOString().substring(0,10)}`);
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
  const [solved, setSolved] = useLocalStorage<Solved>("solved");
  const [riddle, setRiddle] = useState<Riddle>();
  const [userSolution, setUserSolution] = useState<String>("");
  // const searchParams = useSearchParams();
  useEffect(() => {
    if (!db) {
      return;
    }
    const dbRiddle = db.selectObject(
      `SELECT * FROM riddles WHERE dt<='${new Date()
        .toISOString()
        .substring(0, 10)}' ORDER BY dt DESC LIMIT 1`
    );
    if (!dbRiddle) {
      return;
    }
    const facts: FactItem[] = db.selectObjects(
      `SELECT * FROM facts WHERE riddle_id=? ORDER BY \`order\``,
      dbRiddle.id
    ) as FactItem[];
    const clues: Clue[] = db.selectObjects(
      `SELECT * FROM clues WHERE riddle_id=? ORDER BY \`order\``,
      dbRiddle.id
    ) as Clue[];
    setRiddle({
      id: dbRiddle.id as number,
      solution: dbRiddle.solution as string,
      product_name: dbRiddle.product_name as string,
      photo: dbRiddle.photo as string,
      clues: clues,
      facts: facts,
    });
    if (currentRiddleID !== dbRiddle.id) {
      setAttempt(1);
      setCurrentRiddleID(dbRiddle.id as number);
    }
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
    <main className={styles.main} dir="rtl">
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

      <FactTable className="layout" facts={riddle.facts} />
      {gameState === GameState.IN_PROGRESS && <Clues clues={riddle.clues.slice(0, attempt - 1)} />}
      <div className="footer d-block">
        {gameState == GameState.IN_PROGRESS ? (
          <>
            <div className="panel" dir="rtl">
              <input
                type="text"
                placeholder="ניחוש"
                onChange={(e) => setUserSolution(e.target.value)}
              ></input>
            </div>

            <div className="panel" dir="rtl">
              <button onClick={onClickSolve} disabled={!Boolean(userSolution)}>
                שליחה
              </button>
              <button onClick={() => {}} disabled={true}>
                דלג
              </button>
            </div>
            <div className="panel">
              <div className="mistakes mt-4">
                ניחושים שנותרו:&nbsp;&nbsp;&nbsp;
                {"⏺ ".repeat(MAX_ATTEMPTS + 1 - attempt)}
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
        riddle={riddle}
        isOpen={isSummaryOpen}
        isSuccess={gameState === GameState.SUCCESS}
        onClose={() => setIsSummaryOpen(false)}
      />
    </main>
  );
}
