import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const [playerWins, setPlayerWins] = useState(0);
  const [aiWins, setAiWins] = useState(0);
  const [draws, setDraws] = useState(0);

  const learningRate = 0.1;
  const explorationRate = 0.1;
  const Q = {};

  useEffect(() => {
    if (calculateWinner(board)) {
      setWinner(calculateWinner(board));
    } else if (board.every((square) => square !== null)) {
      setWinner('Draw');
    } else if (!xIsNext) {
      const timeoutId = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [board, xIsNext]);

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    
    return squares.every(square => square !== null) ? 'Draw' : null;
  }

  function makeAIMove() {
    const availableMoves = board.map((square, index) => (square === null ? index : null)).filter((item) => item !== null);
    let bestMove;
    let bestScore = -Infinity;
    
    availableMoves.forEach(move => {
      const newBoard = [...board];
      newBoard[move] = 'O';
      const score = minimax(newBoard, 0, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });
  
    const newBoard = [...board];
    newBoard[bestMove] = 'O';
    setBoard(newBoard);
    setXIsNext(true);
  }
  
  function minimax(board, depth, isMaximizingPlayer) {
    const winner = calculateWinner(board);
    if (winner !== null) {
      if (winner === 'O') {
        return 10 - depth; // Favorable score for AI
      } else if (winner === 'X') {
        return depth - 10; // Unfavorable score for AI
      } else {
        return 0; // Draw
      }
    }
  
    if (isMaximizingPlayer) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          const newBoard = [...board];
          newBoard[i] = 'O';
          const score = minimax(newBoard, depth + 1, false);
          bestScore = Math.max(bestScore, score);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          const newBoard = [...board];
          newBoard[i] = 'X';
          const score = minimax(newBoard, depth + 1, true);
          bestScore = Math.min(bestScore, score);
        }
      }
      return bestScore;
    }
  }

  useEffect(() => {
    const winner = calculateWinner(board);
    if (winner === 'X') {
      setPlayerWins((prevWins) => prevWins + 1);
      updateQValues(board, -1);
    } else if (winner === 'O') {
      setAiWins((prevWins) => prevWins + 1);
      updateQValues(board, 1);
    } else if (winner === 'Draw') {
      setDraws((prevDraws) => prevDraws + 1);
      updateQValues(board, 0);
    }
  }, [winner]);

  function updateQValues(state, reward) {
    const stateString = state.join('');
    Q[stateString] = Q[stateString] || 0;
    const nextState = state.map((value, index) => (value === null ? 'O' : value));
    const nextStateString = nextState.join('');
    const nextQValue = Q[nextStateString] || 0;
    const updatedQValue = Q[stateString] + learningRate * (reward + nextQValue - Q[stateString]);
    Q[stateString] = updatedQValue;
  }

  function handleClick(i) {
    const newBoard = [...board];
    if (winner || newBoard[i]) return;
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  function renderSquare(i) {
    return (
      <button className="square" onClick={() => handleClick(i)}>
        {board[i]}
      </button>
    );
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setXIsNext(true);
  }

  return (
    <div className="game">
      <div className="game-board">
        <div className="board-row">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="board-row">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="board-row">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>
      <div className="game-info">
        <div>{winner ? `Winner: ${winner}` : `Next player: ${xIsNext ? 'X' : 'O'}`}</div>
        <div>{`Player Wins: ${playerWins}`}</div>
        <div>{`AI Wins: ${aiWins}`}</div>
        <div>{`Draws: ${draws}`}</div>
        {winner && (
          <button onClick={resetGame}>Play Again</button>
        )}
      </div>
    </div>
  )
}