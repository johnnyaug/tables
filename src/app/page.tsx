'use client'

import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'
import Countdown from 'react-countdown'
import GridLayout, { WidthProvider } from 'react-grid-layout'
import Summary from './Summary'
import styles from './page.module.css'
import '/node_modules/react-grid-layout/css/styles.css'
import '/node_modules/react-resizable/css/styles.css'
import toast, { Toaster } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation'

const ResponsiveGridLayout = WidthProvider(GridLayout);

const GameState = {
  IN_PROGRESS: 'in_progress',
  SUCCESS: 'success',
  FAILURE: 'failure'
}

interface GuessWord {
  wordId: number,
  group: number
}
interface Riddle {
  id: number,
  orders: number[],
  words: string[][],
  groupDescriptions: string[]
}

export interface Guess extends Array<GuessWord> { }

export default function Board() {
  const [solvedGroups, setSolvedGroups] = useLocalStorage<number[]>('solvedGroups', [])
  const [shownGroups, setShownGroups] = useLocalStorage<number[]>('shownGroups', [])
  const [selected, setSelected] = useState<number[]>([])
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [guessHistory, setGuessHistory] = useLocalStorage<Guess[]>('guessHistory', [])
  const [mistakesRemaining, setMistakesRemaining] = useLocalStorage('mistakesRemaining', 4)
  const [currentRiddleID, setCurrentRiddleID] = useLocalStorage('currentRiddleID', 0)
  const [riddle, setRiddle] = useState<Riddle>()
  const searchParams = useSearchParams();

  useEffect(() => {
    const today = DateTimeFormatter.ISO_LOCAL_DATE.format(LocalDate.now())
    fetch(`./riddles.json?dt=${today}`).then((res) => res.json()).then((data) => {      
      let dtKey = Object.keys(data).find((key) => key <= today)
      if (!dtKey) {
        dtKey = Object.keys(data)[0]
      }
      if (searchParams.has('preview')) {
        dtKey = Object.keys(data)[0]
      }
      const todayData = data[dtKey]
      setRiddle(todayData)
      if (currentRiddleID !== todayData.id) {
        setSolvedGroups([])
        setShownGroups([])
        setGuessHistory([])
        setMistakesRemaining(4)
        setCurrentRiddleID(todayData.id)
      }
    })
  }, [])
  const gameState = solvedGroups.length === 4 ? GameState.SUCCESS : (mistakesRemaining <= 0 ? GameState.FAILURE : GameState.IN_PROGRESS)

  if (!riddle) {
    return
  }
  const onClickSolve = () => {
    if (selected.length !== 4) {
      return
    }
    if (mistakesRemaining <= 0) {
      return
    }

    let newGameState: string = GameState.IN_PROGRESS
    if (guessHistory.some((guessWords => guessWords.every((gw) => selected.includes(gw.wordId))))) {
      toast("ניחשת את זה כבר")
      return
    }
    const currentGuess: Guess = selected.map((id) => ({ wordId: id, group: wordsObj[id].group }))
    setGuessHistory([...guessHistory, currentGuess])
    const currentGuessGroups = currentGuess.map((word) => word.group)
    const commonGroup = currentGuessGroups.reduce((a, b) => a === b ? a : NaN)
    if (!isNaN(commonGroup)) {
      const newSolvedGroups = [...solvedGroups, commonGroup]
      setSolvedGroups(newSolvedGroups)
      setSelected([])
      if (newSolvedGroups.length === 4) {
        newGameState = GameState.SUCCESS
      }
      setShownGroups([...newSolvedGroups])
    } else {
      if (mistakesRemaining - 1 <= 0) {
        newGameState = GameState.FAILURE
      }
      setMistakesRemaining(mistakesRemaining - 1)
    }
    // check if game is over
    if (newGameState === GameState.FAILURE) {
      const newShownGroups = [...shownGroups]
      let count = 0
      for (let i = 0; i < 4; i++) {
        if (!solvedGroups.includes(i)) {
          setTimeout(() => {
            newShownGroups.push(i)
            setShownGroups([...newShownGroups])
          }, 1000 * count++)
        }
      }
      setTimeout(() => {
        setIsSummaryOpen(true)
      }, 1500 + 1000 * count++)
    }
    if (newGameState === GameState.SUCCESS) {
      setTimeout(() => {
        setIsSummaryOpen(true)
      }, 2000)
    }
  }
  let wordsObj = riddle.words.flatMap((group: string[], i: number) => {
    return group.map((word: string, j: number) => {
      return { word, id: i * 4 + j, group: i, order: riddle.orders[i * 4 + j] }
    })
  })
  const shuffle = () => {
    let newOrders = [...riddle.orders]
    for (let i = newOrders.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i)
      let tmp = newOrders[i]
      newOrders[i] = newOrders[j]
      newOrders[j] = tmp
    }
    setRiddle({ ...riddle, orders: newOrders })
  }

  const onClickWord = (word: { [id: string]: any }) => {
    if (selected.includes(word.id)) {
      setSelected(selected.filter((j) => j !== word.id))
    } else {
      if (selected.length === 4) {
        return
      }
      setSelected([...selected, word.id])
    }
  }

  return (
    <main className={styles.main}>
      <Toaster containerStyle={{
        bottom: '40px',


      }} toastOptions={{
        style: {
          backgroundColor: 'black',
          color: 'white',
        },
        position: "bottom-center",
        duration: 2000,
      }} />

      <ResponsiveGridLayout className="layout" rowHeight={100} cols={4} >
        {shownGroups.map((group, i) => {
          return <div dir="rtl" className={"d-flex wordgroup group-" + group} key={"g" + group} data-grid={{ x: 0, y: i, w: 33, h: 1, static: true }}>
            <div className="title h4">{riddle.groupDescriptions[group]}</div>
            <div className="words">{riddle.words[group].join(', ')}</div>
          </div>
        })}
        {
          wordsObj.filter((word) => !shownGroups.includes(word.group)).sort((a, b) => a.order - b.order).map((word, i) => {
            return <div key={"w" + word.id} className={'h4 word ' + (selected.includes(word.id) ? 'selected' : '')} data-grid={{ x: i % 4, y: Math.floor(i / 4) + shownGroups.length, w: 1, h: 1, static: true }} onClick={() => onClickWord(word)}>{word.word}</div>
          })
        }
      </ResponsiveGridLayout>
      <div className='footer d-block'>
        {gameState == GameState.IN_PROGRESS ? <>
          <div className='panel'>
            <div className='mistakes'>טעויות נותרו: {mistakesRemaining}</div>
          </div>
          <div className='panel'>
            <button onClick={onClickSolve}>שליחה</button>
            <button onClick={shuffle}>ערבוב</button>
            <button onClick={() => setSelected([])}>ניקוי</button>
          </div>
        </> :
          <><div className='panel' >
            <button onClick={() => setIsSummaryOpen(true)}>תוצאות</button>
          </div>
            <div className='panel' dir="rtl">
              <div className='h5'>
                <div className="mb-2 mt-4">זמן עד החידה הבאה:</div>
                <Countdown renderer={r => String(r.hours).padStart(2, "0") + ":" + String(r.minutes).padStart(2, "0") + ":" + String(r.seconds).padStart(2, "0")} date={new Date().setHours(23, 59, 59)} />
              </div>
            </div>
          </>}
      </div>
      {!process.env.NODE_ENV || process.env.NODE_ENV === 'development' &&
        <button onClick={() => {
          localStorage.clear()
          window.location.reload()
        }}>XXX</button>}
      <Summary puzzleNumber={riddle.id} isOpen={isSummaryOpen} isSuccess={solvedGroups.length == 4} onClose={() => setIsSummaryOpen(false)} guessHistory={guessHistory} />
    </main >
  )
}
