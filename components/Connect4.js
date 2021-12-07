import { useEffect, useReducer, useState } from 'react'
import { Row } from './Row'
import { Button, Text, Flex, Box } from '@chakra-ui/react'
import { checkForWin, deepCloneBoard, generateNewBoard } from '../gameUtils'
import * as gameStyles from '../styles/Home.module.css'

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'newGame':
      return {
        ...initialGameState,
        board: action.board,
        player1: action.starter === 'RED' ? 1 : 2,
        player2: action.starter === 'RED' ? 2 : 1,
        currentPlayer: action.starter === 'RED' ? 1 : 2,
      }
    case 'togglePlayer':
      return {
        ...state,
        currentPlayer: action.nextPlayer,
        board: action.board,
        inProgress: true,
      }
    case 'endGame':
      return {
        ...state,
        gameOver: true,
        message: action.message,
        board: action.board,
        inProgress: false,
      }
    case 'updateMessage':
      return {
        ...state,
        message: action.message,
      }
    case 'nextRound':
      return {
        ...state,
        message: '',
        board: action.board,
        gameOver: false,
        currentPlayer: action.nextPlayer,
      }
    default:
      throw Error(`Action "${action.type}" is not a valid action.`)
  }
}
const initialGameState = {
  player1: 1,
  player2: 2,
  currentPlayer: 1,
  board: [
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
  ],
  gameOver: false,
  message: '',
  inProgress: false,
}
export const Connect4 = () => {
  const [starter, setStarter] = useState('RED')

  const [gameState, dispatchGameState] = useReducer(
    gameReducer,
    initialGameState
  )

  // triggered when a user clicks a cell
  const play = (c) => {
    if (!gameState.gameOver) {
      let board = deepCloneBoard(gameState.board)
      //check if cell is taken by starting at the bottom row and working up
      for (let r = 5; r >= 0; r--) {
        if (!board[r][c]) {
          board[r][c] = gameState.currentPlayer
          break
        }
      }

      // Check status of board
      let result = checkForWin(board)
      if (result === gameState.player1) {
        dispatchGameState({
          type: 'endGame',
          message: 'Player1 wins!',
          board,
        })
      } else if (result === gameState.player2) {
        dispatchGameState({
          type: 'endGame',
          message: 'Player2 wins!',
          board,
        })
      } else if (result === 'draw') {
        dispatchGameState({
          type: 'endGame',
          message: 'Draw Game!',
          board,
        })
      } else {
        const nextPlayer =
          gameState.currentPlayer === gameState.player1
            ? gameState.player2
            : gameState.player1

        dispatchGameState({ type: 'togglePlayer', nextPlayer, board })
      }
    }
    // it's gameover and a user clicked a cell
    else {
      const nextPlayer =
        gameState.currentPlayer === gameState.player1
          ? gameState.player2
          : gameState.player1
      dispatchGameState({
        type: 'nextRound',
        board: generateNewBoard(),
        nextPlayer,
      })
    }
  }

  useEffect(() => {
    if (!gameState.inProgress) {
      dispatchGameState({ type: 'newGame', board: generateNewBoard(), starter })
    }
  }, [starter])

  return (
    <>
      <Flex alignItems="center">
        <Text fontSize="xl" fontWeight="bold" color="red.500">
          Choose Who Goes First:
        </Text>
        <Box
          className={gameStyles.player1}
          borderColor="blue.500"
          borderWidth={starter === 'RED' ? 3 : 0}
          onClick={() => setStarter('RED')}
        />
        <Box
          className={gameStyles.player2}
          borderColor="blue.500"
          borderWidth={starter === 'YELLOW' ? 3 : 0}
          onClick={() => setStarter('YELLOW')}
        />
      </Flex>
      <Flex gridGap="20px">
        <Button
          colorScheme="purple"
          className={gameStyles.button}
          onClick={() => {
            dispatchGameState({
              type: 'newGame',
              board: generateNewBoard(),
              starter,
            })
          }}
        >
          New Game
        </Button>

        <Button
          colorScheme="teal"
          className={gameStyles.button}
          onClick={() => {
            const nextPlayer =
              gameState.currentPlayer === gameState.player1
                ? gameState.player2
                : gameState.player1
            dispatchGameState({
              type: 'nextRound',
              board: generateNewBoard(),
              nextPlayer,
            })
          }}
        >
          Next Round
        </Button>
      </Flex>

      <Text fontSize="lg" fontWeight="bold">
        {gameState.message}
      </Text>

      <table>
        <tbody>
          {gameState.board.map((row, i) => (
            <Row key={i} row={row} play={play} />
          ))}
        </tbody>
      </table>
    </>
  )
}
