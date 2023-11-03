document.addEventListener("DOMContentLoaded", function () {
  const chessboard = document.getElementById("chessboard");
  const turnElement = document.getElementById("turn");
  const timerElement = document.getElementById("timer");

  const socket = io();

  let timer;
  let secondsRemaining = 30;
  let timeoutThreshold = 0; // Time in seconds to declare timeout, set to 0 for no timeout
  let gameIsOver = false;

  let selectedPiece = null;
  let currentPlayer = 1;

  // Function to send a message to the server
  function sendMessage(selectedPieceRow, selectedPiecCol, row, col) {
    socket.emit("sendGameState", {
      selectedPieceRow,
      selectedPiecCol,
      row,
      col,
    });

    updateTurn();
    clearInterval(timer);
    timerElement.textContent = "";
    chessboard.addEventListener("click", handleSquareClick);
  }
  // Listen for the received message from the server
  socket.on("receiveGameState", (currentState) => {
    const { selectedPieceRow, selectedPiecCol, row, col } = currentState;
    moveRook(selectedPieceRow, selectedPiecCol, row, col);
    clearInterval(timer);
    startTimer();
    updateTurn(row, col);
    chessboard.removeEventListener("click", handleSquareClick);
  });

  function createSquare(row, col, isWhite) {
    const square = document.createElement("div");
    square.className = isWhite ? "square white" : "square black";
    square.dataset.row = row;
    square.dataset.col = col;

    square.addEventListener("click", () => handleSquareClick(row, col));

    return square;
  }

  function createPiece(isRook) {
    const piece = document.createElement("img");
    piece.src = isRook ? "./assets/wrook.png" : "";
    piece.className = "piece";
    piece.draggable = false;
    return piece;
  }

  function addWinningImage(square) {
    const image = document.createElement("img");
    image.src = "./assets/winningimg.png";
    image.className = "piece";
    square.appendChild(image);
  }

  function startTimer() {
    secondsRemaining = 30;
    updateTimerDisplay();
    timer = setInterval(updateTimer, 1000);
  }

  // Function to update the timer
  function updateTimer() {
    secondsRemaining--;
    if (secondsRemaining <= 0) {
      clearInterval(timer);
      // Handle timeout or move validation here
      handleTimeout();
    }
    updateTimerDisplay();
  }
  function handleTimeout() {
    if (timeoutThreshold > 0 && secondsRemaining <= -timeoutThreshold) {
      // Player took too long, their opponent wins
      clearInterval(timer);
      gameIsOver = true;
      turnElement.textContent = `Player ${currentPlayer}\ lost due to time limit`;
      chessboard.removeEventListener("click", handleSquareClick);
    }
  }
  // Function to update the timer display
  function updateTimerDisplay() {
    timerElement.textContent = `${secondsRemaining} seconds Remaning`;
  }

  function handleSquareClick(row, col) {
    if (selectedPiece) {
      if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
        moveRook(selectedPiece.row, selectedPiece.col, row, col);
        sendMessage(
          selectedPiece.row,
          selectedPiece.col,
          row,
          col,
          currentPlayer
        );
      }
      clearPossibleMoves();
      selectedPiece = null;
    } else {
      const piece = chessboard.querySelector(
        `[data-row="${row}"][data-col="${col}"] .piece`
      );
      if (piece && piece.src.includes("rook.png")) {
        selectedPiece = { row, col };
        // Allow all four directions
        showPossibleMoves(row, col, ["left", "down"]);
      }
    }
  }

  function isValidMove(fromRow, fromCol, toRow, toCol) {
    // Check if the destination is in the allowed directions
    return (
      (fromRow === toRow && fromCol > toCol) || // Left
      (fromRow === toRow && fromCol < toCol) || // Right
      (fromRow > toRow && fromCol === toCol) || // Up
      (fromRow < toRow && fromCol === toCol) // Down
    );
  }

  function moveRook(fromRow, fromCol, toRow, toCol) {
    const fromSquare = chessboard.querySelector(
      `[data-row="${fromRow}"][data-col="${fromCol}"]`
    );
    const toSquare = chessboard.querySelector(
      `[data-row="${toRow}"][data-col="${toCol}"]`
    );

    if (fromSquare && toSquare) {
      const rook = fromSquare.querySelector(".piece");
      toSquare.appendChild(rook);
    }
    if (toRow === 7 && toCol === 0) {
      turnElement.textContent = `Player ${currentPlayer} Wins!`;
      clearInterval(timer); // Remove the timer
      timerElement.textContent = "";
      turnElement.textContent = `Player ${currentPlayer} Wins!`;

      chessboard.removeEventListener("click", handleSquareClick);

      return;
    }
    //updateTurn();
  }
  function updateTurn(toRow, toCol) {
    if (currentPlayer === 1) {
      currentPlayer = 2;
    } else {
      currentPlayer = 1;
    }

    if (toRow === 7 && toCol === 0) {
      turnElement.textContent = `Player ${currentPlayer} Wins!`;
      clearInterval(timer); // Remove the timer
      timerElement.textContent = "";
      turnElement.textContent = `Player ${currentPlayer} Wins!`;

      chessboard.removeEventListener("click", handleSquareClick);

      return;
    }
    turnElement.textContent = `Player ${currentPlayer}\'s turn`;
  }

  function showPossibleMoves(row, col, directions) {
    // Clear previous possible move indicators
    clearPossibleMoves();

    // Show possible moves based on allowed directions
    if (directions.includes("left")) {
      // Show possible moves horizontally (left)
      for (let i = col - 1; i >= 0; i--) {
        const square = chessboard.querySelector(
          `[data-row="${row}"][data-col="${i}"]`
        );
        if (square) {
          const possibleMoveIndicator = document.createElement("div");
          possibleMoveIndicator.className = "possible-move";
          square.appendChild(possibleMoveIndicator);
        }
      }
    }

    if (directions.includes("right")) {
      // Show possible moves horizontally (right)
      for (let i = col + 1; i < 8; i++) {
        const square = chessboard.querySelector(
          `[data-row="${row}"][data-col="${i}"]`
        );
        if (square) {
          const possibleMoveIndicator = document.createElement("div");
          possibleMoveIndicator.className = "possible-move";
          square.appendChild(possibleMoveIndicator);
        }
      }
    }

    if (directions.includes("up")) {
      // Show possible moves vertically (up)
      for (let i = row - 1; i >= 0; i--) {
        const square = chessboard.querySelector(
          `[data-row="${i}"][data-col="${col}"]`
        );
        if (square) {
          const possibleMoveIndicator = document.createElement("div");
          possibleMoveIndicator.className = "possible-move";
          square.appendChild(possibleMoveIndicator);
        }
      }
    }

    if (directions.includes("down")) {
      // Show possible moves vertically (down)
      for (let i = row + 1; i < 8; i++) {
        const square = chessboard.querySelector(
          `[data-row="${i}"][data-col="${col}"]`
        );
        if (square) {
          const possibleMoveIndicator = document.createElement("div");
          possibleMoveIndicator.className = "possible-move";
          square.appendChild(possibleMoveIndicator);
        }
      }
    }
  }

  function clearPossibleMoves() {
    const possibleMoveIndicators = document.querySelectorAll(".possible-move");
    possibleMoveIndicators.forEach((indicator) => indicator.remove());
  }

  function initializeChessboard() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isWhite = (row + col) % 2 === 0;
        const square = createSquare(row, col, isWhite);

        if (row === 0 && col === 7) {
          const rook = createPiece(true);

          square.appendChild(rook);
        }

        if (row === 7 && col === 0) {
          addWinningImage(square);
        }

        chessboard.appendChild(square);
      }
    }
  }
  clearInterval(timer); // Remove the timer
  timerElement.textContent = "";
  initializeChessboard();
  turnElement.textContent = "Player 1's turn";
});
