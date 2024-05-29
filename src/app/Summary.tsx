import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { Guess } from './page';

interface SummaryProps {
    isOpen: boolean,
    onClose: () => void,
    isSuccess: boolean,
    guessHistory: Guess[],
    puzzleNumber: number
}

export default function Summary({ isOpen, isSuccess, onClose, guessHistory, puzzleNumber }: SummaryProps) {
    const groupEmoji: { [key: number]: string } = {
        0: '🟨',
        1: '🟩',
        2: '🟦',
        3: '🟪'
    }
    const summaryStyles = {
        content: {
            top: '20%',
            maxWidth: '450px',
            maxHeight: '550px',
            margin: 'auto',
            textAlign: 'center',
            border: 0,
            direction: 'rtl',
            filter: 'drop-shadow(0 0 0.75rem grey)',
            animation: 'fadeIn 1s',

        },
        overlay: {
            backgroundColor: 'rgba(255, 255, 255, 0.75)'
        }
    };
    const getGroupsHistory = () => guessHistory.map((guess) => {
        return guess.map((guessWord) => guessWord.group)
    })
    const title = isSuccess ? 'כל הכבוד!' : 'אולי בפעם הבאה';
    return <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        // @ts-ignore
        style={summaryStyles}
    >
        <div className='close-button' onClick={onClose}>
              <span aria-hidden="true">&times;</span>
        </div>
        <h1 className='mt-4'>{title}</h1>
        <div className='container guess-chart mt-5'>
            {
                getGroupsHistory().map((guessGroups, i) => {
                    return <div className='row m-auto guess' key={i}>
                        {guessGroups.reverse().map((group, j) => {
                            return <div className={'col group group-' + group} key={j}></div>
                        })}
                    </div>
                })
            }
        </div>
        <div className='panel mt-5'>
            <button onClick={async () => {
                await navigator.clipboard.writeText(`קישורים #${puzzleNumber}
${guessHistory.map((guess) => guess.map((gw) => groupEmoji[gw.group]).join('')).join('\n')}
רוצה לנסות גם?
https://kishurim.netlify.app/`)
                toast("הועתק")
            }}>שיתוף</button>
        </div>
    </Modal>
}