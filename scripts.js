'use strict';

let playerOne;
let playerTwo;

const displayController = (() => {
  let gameDifficulty = 'easy';
  let gameMode;
  const getGameMode = () => gameMode;

  const cssRoot = getComputedStyle(document.documentElement);
  const playerOneColor = cssRoot.getPropertyValue('--player1');
  const playerOneSymbolURL = 'svg/cross.svg';
  const playerTwoColor = cssRoot.getPropertyValue('--player2');
  const playerTwoPicture = 'svg/player-alt.svg';
  const playerTwoSymbol = 'svg/circle-blue.svg';
  const robotColor = cssRoot.getPropertyValue('--robot');
  const robotPicture = 'svg/robot.svg';
  const robotSymbol = 'svg/circle-red.svg';

  const gameScreens = document.querySelectorAll('.game');
  const navigationBtns = document.querySelectorAll('.navigation');

  const playerOneInput = document.querySelector('#player-1');
  const playerTwoInput = document.querySelector('#player-2');
  const enemyCards = document.querySelectorAll('.score-p2');
  const enemyPictures = document.querySelectorAll('.enemy-picture');
  const enemySymbol = document.querySelector('.enemy-symbol');
  const difficultyBtns = document.querySelectorAll('.difficulty');

  const boardPlayerCards = document.querySelectorAll('.player-card');
  const boardPlayerOneCards = document.querySelectorAll('.card-p1');
  const boardPlayerOneName = document.querySelector('.player-info__name-1');
  const boardPlayerOneScores = document.querySelectorAll('.score-p1__points');
  const boardPlayerTwoCards = document.querySelectorAll('.card-p2');
  const boardPlayerTwoName = document.querySelector('.player-info__name-2');
  const boardPlayerTwoScores = document.querySelectorAll('.score-p2__points');
  const boardDifficultyTag = document.querySelector('.player-info__difficulty');
  const boardSquares = document.querySelectorAll('.board__square');
  const boardNextRoundBtn = document.querySelector('.controls__next-round');
  const boardResetScoreBtn = document.querySelector('.controls__reset-score');
  const roundResult = document.querySelector('.round-result');
  const roundResultWinner = document.querySelector('.result--winner');
  const roundResultMessage = document.querySelector('.result--text');

  const setDisplayStyle = (value, ...elements) => {
    elements.forEach((element) => (element.style.display = value));
  };

  const navigageTo = (screen) => {
    prepareScreen(screen);
    hideAllScreens();
    showScreen(screen);
  };

  navigationBtns.forEach((button) => {
    button.addEventListener('click', () => {
      navigageTo(button.dataset.target);
    });
  });

  const prepareScreen = (screen) => {
    switch (screen) {
      case 'game--menu':
        gameBoard.resetGame();
        resetGame();
        break;

      case 'game--pvp':
        setEnemyAttributes(playerTwoPicture, playerTwoColor, playerTwoSymbol);
        gameMode = 'pvp';
        break;

      case 'game--pve':
        setEnemyAttributes(robotPicture, robotColor, robotSymbol);
        gameMode = 'pve';
        break;

      case 'game--board':
        createPlayers();
        refreshScores();
        fillBoardCards();
        animatePlayerCard('x'); // When starting a new match, X always goes first
        break;
    }
  };

  const hideAllScreens = () => {
    gameScreens.forEach((screen) => setDisplayStyle('none', screen));
  };

  const showScreen = (screen) => {
    setDisplayStyle('grid', document.querySelector(`.${screen}`));
  };

  const setEnemyAttributes = (pictureURL, colorValue, symbolURL) => {
    enemyPictures.forEach((enemyPicture) => (enemyPicture.src = pictureURL));
    enemyCards.forEach((enemyCard) => (enemyCard.style.color = colorValue));
    enemySymbol.src = symbolURL;
  };

  const toggleDifficultyBtn = (clickedButton) => {
    difficultyBtns.forEach((button) => {
      button.classList.remove('current-difficulty');
      button.classList.add('animate-bob', 'animate-grayscale');
    });
    clickedButton.classList.add('current-difficulty');
    clickedButton.classList.remove('animate-bob', 'animate-grayscale');
  };

  difficultyBtns.forEach((button) =>
    button.addEventListener('click', () => {
      toggleDifficultyBtn(button);
      gameDifficulty = button.dataset.difficulty;
    })
  );


  const getDifficultyFactor = () => {
    switch (gameDifficulty) {
      case 'easy':
        return 60;

      case 'mid':
        return 80;

      case 'hard':
        return 100;
    }
  };

  const createPlayers = () => {
    switch (gameMode) {
      case 'pvp':
        playerOne = Player(playerOneInput.value || 'Player 1');
        playerTwo = Player(playerTwoInput.value || 'Player 2');
        break;

      case 'pve':
        playerOne = Player('Human');
        playerTwo = Player('Robot', getDifficultyFactor());
        break;
    }
  };

  const fillBoardCards = () => {
    switch (gameMode) {
      case 'pvp':
        boardPlayerOneName.textContent = playerOne.getName();
        boardPlayerTwoName.textContent = playerTwo.getName();
        setDisplayStyle('flex', boardPlayerTwoName);
        setDisplayStyle('none', boardDifficultyTag);
        break;

      case 'pve':
        boardPlayerOneName.textContent = playerOne.getName();
        setDisplayStyle('none', boardPlayerTwoName);
        setDisplayStyle('flex', boardDifficultyTag);
        boardDifficultyTag.textContent = gameDifficulty;
        boardDifficultyTag.classList.add(gameDifficulty);
        break;
    }
  };

  const fillSquare = (squareIndex, isPlayerOneTurn) => {
    const square = document.querySelector(`[data-index='${squareIndex}']`)
      .firstElementChild;

    const playerSymbolURL = isPlayerOneTurn
      ? playerOneSymbolURL
      : enemySymbol.src;

    square.src = playerSymbolURL;
  };

  boardSquares.forEach((boardSquare) => {
    boardSquare.addEventListener('click', (square) => {
      const squareIndex = square.currentTarget.dataset.index;
      gameBoard.makeMove(squareIndex);
    });
  });

  const processResult = (winner) => {
    switch (winner) {
      case 'x':
        setRoundResultMsg(playerOne.getName(), 'Wins!', playerOneColor);
        refreshScores();
        break;

      case 'o':
        setRoundResultMsg(
          playerTwo.getName(),
          'Wins!',
          enemyCards[0].style.color
        );
        refreshScores();
        break;

      case 'tie':
        animatePlayerCard();
        setRoundResultMsg('', `It's a drawn!`);
        break;
    }
    setDisplayStyle('flex', roundResult, boardNextRoundBtn, boardResetScoreBtn);
  };

  const setRoundResultMsg = (winner, message, color = '') => {
    roundResultWinner.innerText = winner;
    roundResultWinner.style.color = color;
    roundResultMessage.innerText = message;
  };

  const animatePlayerCard = (symbol) => {
    boardPlayerCards.forEach((card) =>
      card.classList.remove('animate-bob-turn')
    );
    switch (symbol) {
      case 'x':
        boardPlayerOneCards.forEach((card) =>
          card.classList.add('animate-bob-turn')
        );
        break;

      case 'o':
        boardPlayerTwoCards.forEach((card) =>
          card.classList.add('animate-bob-turn')
        );
        break;
    }
  };

  boardNextRoundBtn.addEventListener('click', () => gameBoard.resetTurn());
  boardResetScoreBtn.addEventListener('click', () => {
    playerOne.resetScore();
    playerTwo.resetScore();
    refreshScores();
  });

  const refreshScores = () => {
    boardPlayerOneScores.forEach(
      (score) => (score.innerText = playerOne.getScore())
    );
    boardPlayerTwoScores.forEach(
      (score) => (score.innerText = playerTwo.getScore())
    );
  };

  const clearBoard = () => {
    boardSquares.forEach((square) => (square.firstElementChild.src = ''));
    setDisplayStyle('none', roundResult, boardNextRoundBtn, boardResetScoreBtn);
  };

  const resetTurn = () => {
    clearBoard();
    animatePlayerCard(gameBoard.getCurrentPlayerSymbol());
  };

  const resetGame = () => {
    clearBoard();
    playerOneInput.value = '';
    playerTwoInput.value = '';
    boardDifficultyTag.classList.remove(gameDifficulty);
  };

  return {
    animatePlayerCard,
    fillSquare,
    getGameMode,
    resetTurn,
    processResult,
  };
})();

const Player = (name, difficulty) => {
  let score = 0;
  const getName = () => name;
  const getDifficulty = () => difficulty;
  const getScore = () => score;
  const resetScore = () => (score = 0);
  const winRound = () => (score += 1);

  return {
    getName,
    getDifficulty,
    getScore,
    resetScore,
    winRound,
  };
};

const gameBoard = (() => {
  const winningConditions = [
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  let boardArray = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  let isPlayerOneTurn = true; 
  let isPlayerOneStarting = true;

  const isSquareEmpty = (square) => {
    return typeof square === 'number';
  };

  const getEmptySquares = (board) => {
    return board.filter((square) => isSquareEmpty(square));
  };

  const getCurrentPlayerSymbol = () => {
    return isPlayerOneTurn ? 'x' : 'o';
  };

  const fillSquare = (index) => {
    boardArray[index] = getCurrentPlayerSymbol();
  };

  const changeTurn = () => {
    isPlayerOneTurn = !isPlayerOneTurn;
  };

  const isRobotTurn = () => {
    return !isPlayerOneTurn && displayController.getGameMode() === 'pve';
  };

  const makeMove = (index) => {
    if (!isSquareEmpty(boardArray[index])) return null;
    fillSquare(index);
    displayController.fillSquare(index, isPlayerOneTurn);
    let roundResult = checkRound(boardArray);
    if (roundResult) {
      processResult(roundResult);
    } else {
      changeTurn();
      displayController.animatePlayerCard(getCurrentPlayerSymbol());
      if (isRobotTurn()) makeRobotMove();
    }
  };

  const checkRound = (board) => {
    let winnerSymbol;
    const isWin = winningConditions.some((winPattern) => {
      return winPattern.every((index) => {
        if (isSquareEmpty(board[index])) return false; 
        winnerSymbol = board[index];
        return board[index] === board[winPattern[0]]; 
      });
    });
    if (isWin) return winnerSymbol;

    const emptySquares = getEmptySquares(board);
    const isTie = emptySquares.length === 0;
    if (isTie) return 'tie';

    return null;
  };

  const processResult = (roundResult) => {
    switch (roundResult) {
      case 'x':
        playerOne.winRound();
        break;
      case 'o':
        playerTwo.winRound();
        break;
    }
    displayController.processResult(roundResult);
  };

  const makeRobotMove = () => {
    const bestMoveOdds = playerTwo.getDifficulty();
    if (bestMoveOdds === 100) makeMove(getBestMove());
    else {
      const randomMoveOdds = Math.floor(Math.random() * 101);
      const robotMove =
        bestMoveOdds > randomMoveOdds ? getBestMove() : getRandomMove();
      makeMove(robotMove);
    }
  };

  const getRandomMove = () => {
    const emptySquares = getEmptySquares(boardArray);
    const randomIndex = Math.floor(Math.random() * emptySquares.length);
    return emptySquares[randomIndex];
  };

  const getBestMove = () => {
    const boardState = boardArray; 
    const emptySquares = getEmptySquares(boardState);
    let bestMoveIndex;
    let bestMoveScore = -Infinity;
    let moveScore;

    emptySquares.forEach((index) => {
      boardState[index] = 'o';
      moveScore = minimaxScore(boardState, 0, -Infinity, Infinity, false);
      boardState[index] = index;
      if (moveScore > bestMoveScore) {
        bestMoveScore = moveScore;
        bestMoveIndex = index;
      }
    });
    return bestMoveIndex;
  };

  const minimaxScore = (boardState, depth, alpha, beta, isMaximizing) => {
    const roundResult = checkRound(boardState);
    if (roundResult !== null) return staticEvaluation(roundResult, depth);

    const emptySquares = getEmptySquares(boardState);
    let moveScore;
    if (isMaximizing) {
      let bestMoveScore = -Infinity;
      emptySquares.some((index) => {
        boardState[index] = 'o';
        moveScore = minimaxScore(boardState, depth + 1, alpha, beta, false);
        boardState[index] = index;
        bestMoveScore = Math.max(bestMoveScore, moveScore);
        alpha = Math.max(alpha, bestMoveScore);
        if (alpha >= beta) return true;
      });
      return bestMoveScore;
    } else {
      let bestMoveScore = Infinity;
      emptySquares.some((index) => {
        boardState[index] = 'x';
        moveScore = minimaxScore(boardState, depth + 1, alpha, beta, true);
        boardState[index] = index;
        bestMoveScore = Math.min(bestMoveScore, moveScore);
        beta = Math.min(beta, bestMoveScore);
        if (alpha >= beta) return true;
      });
      return bestMoveScore;
    }
  };

  const staticEvaluation = (roundResult, depth) => {
    switch (roundResult) {
      case 'o':
        return 100 - depth;
      case 'x':
        return -100;
      case 'tie':
        return 0;
    }
  };

  const resetTurn = () => {
    boardArray = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    isPlayerOneStarting = !isPlayerOneStarting;
    isPlayerOneTurn = isPlayerOneStarting;
    displayController.resetTurn();
    if (isRobotTurn()) makeRobotMove();
  };

  const resetGame = () => {
    boardArray = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    isPlayerOneStarting = true;
    isPlayerOneTurn = true;
    playerOne = null;
    playerTwo = null;
  };

  // PUBLIC
  return {
    getCurrentPlayerSymbol,
    makeMove,
    resetTurn,
    resetGame,
  };
})();
