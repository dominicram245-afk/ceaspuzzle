const screens = {
    home: document.getElementById("homeScreen"),
    account: document.getElementById("accountScreen"),
    difficulty: document.getElementById("difficultyScreen"),
    stage: document.getElementById("stageScreen"),
    custom: document.getElementById("customScreen"),
    game: document.getElementById("gameScreen"),
    complete: document.getElementById("completeScreen")
};

const startBtn = document.getElementById("startBtn");
const loginBtn = document.getElementById("loginBtn");
const resumeBtn = document.getElementById("resumeBtn");
const customBtn = document.getElementById("customBtn");
const backToHome1 = document.getElementById("backToHome1");
const backToHome2 = document.getElementById("backToHome2");
const homeBtn = document.getElementById("homeBtn");
const homeBtnFinal = document.getElementById("homeBtnFinal");
const resetBtn = document.getElementById("resetBtn");
const previewBtn = document.getElementById("previewBtn");
const hintBtn = document.getElementById("hintBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const generateBtn = document.getElementById("generateBtn");

const accountTitle = document.getElementById("accountTitle");
const accountSubtitle = document.getElementById("accountSubtitle");
const usernameInput = document.getElementById("usernameInput");
const accountConfirmBtn = document.getElementById("accountConfirmBtn");
const accountBackBtn = document.getElementById("accountBackBtn");
const accountMessage = document.getElementById("accountMessage");

const backToDifficultyBtn = document.getElementById("backToDifficultyBtn");
const stageModeLabel = document.getElementById("stageModeLabel");
const stageButtons = document.querySelectorAll(".stage-btn");

const difficultyLabel = document.getElementById("difficultyLabel");
const stageLabel = document.getElementById("stageLabel");
const timerLabel = document.getElementById("timer");
const movesLabel = document.getElementById("moves");
const hintsLabel = document.getElementById("hints");
const playerLabel = document.getElementById("playerLabel");
const messageBox = document.getElementById("messageBox");
const finalTime = document.getElementById("finalTime");
const finalMoves = document.getElementById("finalMoves");

const puzzleContainer = document.getElementById("puzzleContainer");
const previewOverlay = document.getElementById("previewOverlay");
const previewImage = document.getElementById("previewImage");

const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");

const diffButtons = document.querySelectorAll(".diff-btn");
const customDiffButtons = document.querySelectorAll(".custom-diff");

let topZIndex = 1000;
let accountMode = "register";

const imageSets = {
    intro: ["puzzles/logo.png"],
    easy: [
        "puzzles/easy1.png",
        "puzzles/easy2.png",
        "puzzles/easy3.jpg"
    ],
    difficult: [
        "puzzles/diff1.jpg",
        "puzzles/diff2.jpg",
        "puzzles/diff3.jpg"
    ],
    hard: [
        "puzzles/hard1.jpg",
        "puzzles/hard2.jpg",
        "puzzles/hard3.jpg"
    ]
};

const difficultyGrids = {
    intro: 2,
    easy: 3,
    difficult: 4,
    hard: 5
};

const hintLimits = {
    intro: 1,
    easy: 3,
    difficult: 4,
    hard: 5,
    custom: 3
};

const difficultyNames = {
    intro: "Intro",
    easy: "Easy",
    difficult: "Difficult",
    hard: "Hard",
    custom: "Custom"
};

const state = {
    mode: null,
    stageIndex: 0,
    totalStages: 1,
    gridSize: 0,
    currentImageSrc: "",
    customImageSrc: "",
    customGridSize: 0,
    moves: 0,
    solved: 0,
    totalPieces: 0,
    hintsUsed: 0,
    maxHints: 0,
    timerInterval: null,
    elapsedSeconds: 0,
    startTime: 0,
    playAgainMode: null,
    draggingPiece: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    currentPlayer: "",
    selectedDifficulty: null
};

function getSaveKey() {
    return state.currentPlayer ? `baliktahananSave_${state.currentPlayer}` : null;
}

function savePuzzleProgress() {
    if (!state.currentPlayer) return;
    if (!state.mode) return;
    if (state.mode === "custom") return;

    const pieces = [...puzzleContainer.querySelectorAll(".puzzle-piece")].map(piece => ({
        className: piece.classList.contains("intro-piece") ? "intro-piece" : "auto-piece",
        width: parseFloat(piece.style.width),
        height: parseFloat(piece.style.height),
        left: parseFloat(piece.style.left),
        top: parseFloat(piece.style.top),
        bgX: parseFloat(piece.dataset.bgX),
        bgY: parseFloat(piece.dataset.bgY),
        correctX: parseFloat(piece.dataset.correctX),
        correctY: parseFloat(piece.dataset.correctY),
        locked: piece.dataset.locked === "true",
        zIndex: piece.style.zIndex || "1"
    }));

    const saveData = {
        player: state.currentPlayer,
        mode: state.mode,
        stageIndex: state.stageIndex,
        totalStages: state.totalStages,
        gridSize: state.gridSize,
        currentImageSrc: state.currentImageSrc,
        moves: state.moves,
        solved: state.solved,
        totalPieces: state.totalPieces,
        hintsUsed: state.hintsUsed,
        maxHints: state.maxHints,
        elapsedSeconds: state.elapsedSeconds,
        pieces
    };

    const key = getSaveKey();
    if (key) {
        localStorage.setItem(key, JSON.stringify(saveData));
    }
}

function getSavedPuzzle() {
    const currentUser = state.currentPlayer || localStorage.getItem("baliktahananCurrentUser");
    if (!currentUser) return null;
    const raw = localStorage.getItem(`baliktahananSave_${currentUser}`);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function clearSavedPuzzle() {
    const currentUser = state.currentPlayer || localStorage.getItem("baliktahananCurrentUser");
    if (!currentUser) return;
    localStorage.removeItem(`baliktahananSave_${currentUser}`);
}

function updateResumeButton() {
    const save = getSavedPuzzle();
    resumeBtn.style.display = save ? "inline-block" : "none";
}

function restoreSavedPuzzle(saveData) {
    clearBoard({ resetHints: false });
    showScreen("game");

    state.mode = saveData.mode;
    state.stageIndex = saveData.stageIndex;
    state.totalStages = saveData.totalStages;
    state.gridSize = saveData.gridSize;
    state.currentImageSrc = saveData.currentImageSrc;
    state.moves = saveData.moves;
    state.solved = saveData.solved;
    state.totalPieces = saveData.totalPieces;
    state.hintsUsed = saveData.hintsUsed;
    state.maxHints = saveData.maxHints;
    state.elapsedSeconds = saveData.elapsedSeconds;
    state.playAgainMode = saveData.mode;

    updateHeader();
    updateMoves();
    updateHints();

    previewImage.src = saveData.currentImageSrc;

    const boardSize = getBoardSize();
    const pieceSize = boardSize / saveData.gridSize;

    for (let row = 0; row < saveData.gridSize; row++) {
        for (let col = 0; col < saveData.gridSize; col++) {
            createSlot(col * pieceSize, row * pieceSize, pieceSize, pieceSize);
        }
    }

    saveData.pieces.forEach(data => {
        const piece = document.createElement("div");
        piece.className = `puzzle-piece ${data.className}`;
        piece.style.width = `${data.width}px`;
        piece.style.height = `${data.height}px`;
        piece.style.left = `${data.left}px`;
        piece.style.top = `${data.top}px`;
        piece.style.backgroundImage = `url("${saveData.currentImageSrc}")`;
        piece.style.backgroundSize = `${boardSize}px ${boardSize}px`;
        piece.style.backgroundPosition = `-${data.bgX}px -${data.bgY}px`;
        piece.style.backgroundRepeat = "no-repeat";
        piece.style.zIndex = data.locked ? "1" : data.zIndex;

        piece.dataset.correctX = String(data.correctX);
        piece.dataset.correctY = String(data.correctY);
        piece.dataset.locked = data.locked ? "true" : "false";
        piece.dataset.bgX = String(data.bgX);
        piece.dataset.bgY = String(data.bgY);

        if (data.locked) {
            piece.classList.add("locked");
        } else {
            addDragHandlers(piece);
        }

        puzzleContainer.appendChild(piece);
    });

    setMessage("Progress restored.");

    resetTimer();
    state.startTime = Date.now() - (state.elapsedSeconds * 1000);
    state.timerInterval = setInterval(() => {
        state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
        timerLabel.textContent = `Time: ${formatTime(state.elapsedSeconds)}`;
        savePuzzleProgress();
    }, 250);
}

function showScreen(name) {
    Object.values(screens).forEach(screen => screen.classList.remove("active"));
    screens[name].classList.add("active");
}

function setSelectedButton(buttons, activeButton) {
    buttons.forEach(btn => btn.classList.remove("selected"));
    if (activeButton) activeButton.classList.add("selected");
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
}

function updateMoves() {
    movesLabel.textContent = `Moves: ${state.moves}`;
}

function updateHints() {
    hintsLabel.textContent = `Hints: ${state.hintsUsed}/${state.maxHints}`;
}

function updatePlayerLabel() {
    playerLabel.textContent = `Player: ${state.currentPlayer || "-"}`;
}

function updateHeader() {
    difficultyLabel.textContent = `Difficulty: ${difficultyNames[state.mode] || "-"}`;
    stageLabel.textContent = `Stage: ${state.stageIndex + 1}/${state.totalStages}`;
    updatePlayerLabel();
}

function setMessage(text) {
    messageBox.textContent = text;
}

function resetTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.elapsedSeconds = 0;
    state.startTime = 0;
    timerLabel.textContent = "Time: 0:00";
}

function startTimer() {
    resetTimer();
    state.startTime = Date.now();

    state.timerInterval = setInterval(() => {
        state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
        timerLabel.textContent = `Time: ${formatTime(state.elapsedSeconds)}`;
        savePuzzleProgress();
    }, 250);
}

function clearBoard({ resetHints = true } = {}) {
    resetTimer();
    puzzleContainer.innerHTML = "";
    state.moves = 0;
    state.solved = 0;
    state.totalPieces = 0;
    state.draggingPiece = null;
    topZIndex = 1000;

    if (resetHints) {
        state.hintsUsed = 0;
        state.maxHints = 0;
    }

    updateMoves();
    updateHints();
    setMessage("");
}

function goHome() {
    clearBoard();
    state.mode = null;
    state.stageIndex = 0;
    state.totalStages = 1;
    state.gridSize = 0;
    state.currentImageSrc = "";
    state.selectedDifficulty = null;
    difficultyLabel.textContent = "Difficulty: -";
    stageLabel.textContent = "Stage: -";
    previewOverlay.classList.add("hidden");
    updatePlayerLabel();
    updateResumeButton();

    if (state.currentPlayer) {
        showScreen("difficulty");
    } else {
        showScreen("home");
    }
}

function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

function getBoardSize() {
    return puzzleContainer.clientWidth;
}

function createSlot(x, y, width, height) {
    const slot = document.createElement("div");
    slot.className = "puzzle-slot";
    slot.style.left = `${x}px`;
    slot.style.top = `${y}px`;
    slot.style.width = `${width}px`;
    slot.style.height = `${height}px`;
    puzzleContainer.appendChild(slot);
}

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function createShuffledPositions(totalPieces, pieceW, pieceH, boardSize) {
    const positions = [];
    const padding = 18;
    const perRow = Math.max(2, Math.floor(boardSize / (pieceW + padding)));

    for (let i = 0; i < totalPieces; i++) {
        const row = Math.floor(i / perRow);
        const col = i % perRow;

        let x = col * (pieceW + padding);
        let y = row * (pieceH + padding);

        const maxX = Math.max(0, boardSize - pieceW);
        const maxY = Math.max(0, boardSize - pieceH);

        if (x > maxX) x = maxX;
        if (y > maxY) y = maxY;

        positions.push({ x, y });
    }

    let shuffled = shuffle(positions);

    let sameOrder = shuffled.every((pos, index) => {
        return pos.x === positions[index].x && pos.y === positions[index].y;
    });

    while (sameOrder) {
        shuffled = shuffle(positions);
        sameOrder = shuffled.every((pos, index) => {
            return pos.x === positions[index].x && pos.y === positions[index].y;
        });
    }

    return shuffled;
}

function createPieceBase(className, width, height, imageSrc, boardSize, bgX, bgY, startX, startY, correctX, correctY) {
    const piece = document.createElement("div");
    piece.className = `puzzle-piece ${className}`;
    piece.style.width = `${width}px`;
    piece.style.height = `${height}px`;
    piece.style.left = `${startX}px`;
    piece.style.top = `${startY}px`;
    piece.style.backgroundImage = `url("${imageSrc}")`;
    piece.style.backgroundSize = `${boardSize}px ${boardSize}px`;
    piece.style.backgroundPosition = `-${bgX}px -${bgY}px`;
    piece.style.backgroundRepeat = "no-repeat";

    piece.dataset.correctX = String(correctX);
    piece.dataset.correctY = String(correctY);
    piece.dataset.locked = "false";
    piece.dataset.bgX = String(bgX);
    piece.dataset.bgY = String(bgY);
    piece.style.zIndex = String(++topZIndex);

    addDragHandlers(piece);
    puzzleContainer.appendChild(piece);
    return piece;
}

function addDragHandlers(piece) {
    piece.addEventListener("pointerdown", onPointerDown);
}

function onPointerDown(event) {
    const piece = event.currentTarget;
    if (piece.dataset.locked === "true") return;

    const pieceRect = piece.getBoundingClientRect();
    state.draggingPiece = piece;
    state.dragOffsetX = event.clientX - pieceRect.left;
    state.dragOffsetY = event.clientY - pieceRect.top;

    piece.classList.add("dragging");
    piece.style.zIndex = String(++topZIndex);
    piece.setPointerCapture(event.pointerId);

    piece.addEventListener("pointermove", onPointerMove);
    piece.addEventListener("pointerup", onPointerUp);
    piece.addEventListener("pointercancel", onPointerUp);
}

function onPointerMove(event) {
    if (!state.draggingPiece) return;

    const piece = state.draggingPiece;
    const containerRect = puzzleContainer.getBoundingClientRect();

    let left = event.clientX - containerRect.left - state.dragOffsetX;
    let top = event.clientY - containerRect.top - state.dragOffsetY;

    const maxLeft = puzzleContainer.clientWidth - piece.offsetWidth;
    const maxTop = puzzleContainer.clientHeight - piece.offsetHeight;

    left = Math.max(0, Math.min(left, maxLeft));
    top = Math.max(0, Math.min(top, maxTop));

    piece.style.left = `${left}px`;
    piece.style.top = `${top}px`;
}

function onPointerUp(event) {
    const piece = event.currentTarget;

    piece.classList.remove("dragging");
    piece.removeEventListener("pointermove", onPointerMove);
    piece.removeEventListener("pointerup", onPointerUp);
    piece.removeEventListener("pointercancel", onPointerUp);

    state.moves += 1;
    updateMoves();

    trySnap(piece);
    savePuzzleProgress();

    state.draggingPiece = null;
}

function trySnap(piece) {
    const currentX = parseFloat(piece.style.left);
    const currentY = parseFloat(piece.style.top);
    const correctX = parseFloat(piece.dataset.correctX);
    const correctY = parseFloat(piece.dataset.correctY);

    const tolerance = Math.max(24, piece.offsetWidth * 0.22);
    const dx = currentX - correctX;
    const dy = currentY - correctY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= tolerance) {
        lockPiece(piece);
    }
}

function lockPiece(piece) {
    if (piece.dataset.locked === "true") return;

    piece.style.left = `${piece.dataset.correctX}px`;
    piece.style.top = `${piece.dataset.correctY}px`;
    piece.dataset.locked = "true";
    piece.classList.add("locked");
    piece.style.zIndex = "1";

    state.solved += 1;
    setMessage(`Nice! ${state.solved}/${state.totalPieces} placed.`);
    savePuzzleProgress();

    if (state.solved === state.totalPieces) {
        onPuzzleComplete();
    }
}

function onPuzzleComplete() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    setMessage("Puzzle complete!");

    savePlayerData();
    clearSavedPuzzle();
    updateResumeButton();

    setTimeout(() => {
        finalTime.textContent = `Final Time: ${formatTime(state.elapsedSeconds)}`;
        finalMoves.textContent = `Final Moves: ${state.moves}`;
        showScreen("complete");
    }, 650);
}

async function startIntroPuzzle(imageSrc) {
    try {
        await preloadImage(imageSrc);

        clearBoard({ resetHints: false });
        showScreen("game");

        const boardSize = getBoardSize();
        const cols = 2;
        const rows = 2;
        const pieceW = boardSize / cols;
        const pieceH = boardSize / rows;

        previewImage.src = imageSrc;
        state.totalPieces = 4;

        const defs = [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 1, col: 0 },
            { row: 1, col: 1 }
        ];

        defs.forEach(def => {
            createSlot(def.col * pieceW, def.row * pieceH, pieceW, pieceH);
        });

        const startPositions = [
            { x: pieceW, y: pieceH },
            { x: 0, y: pieceH },
            { x: pieceW, y: 0 },
            { x: 0, y: 0 }
        ];

        defs.forEach((def, index) => {
            createPieceBase(
                "intro-piece",
                pieceW,
                pieceH,
                imageSrc,
                boardSize,
                def.col * pieceW,
                def.row * pieceH,
                startPositions[index].x,
                startPositions[index].y,
                def.col * pieceW,
                def.row * pieceH
            );
        });

        setMessage("Arrange the pieces to complete the logo.");
        startTimer();
        savePuzzleProgress();
    } catch (error) {
        console.error(error);
        alert(error.message);
        setMessage("Could not load the intro image.");
    }
}

async function startAutoPuzzle(imageSrc, gridSize) {
    try {
        await preloadImage(imageSrc);

        clearBoard({ resetHints: false });
        showScreen("game");

        const boardSize = getBoardSize();
        const pieceSize = boardSize / gridSize;
        const totalPieces = gridSize * gridSize;

        previewImage.src = imageSrc;
        state.totalPieces = totalPieces;

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                createSlot(col * pieceSize, row * pieceSize, pieceSize, pieceSize);
            }
        }

        const startPositions = createShuffledPositions(totalPieces, pieceSize, pieceSize, boardSize);

        let i = 0;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                createPieceBase(
                    "auto-piece",
                    pieceSize,
                    pieceSize,
                    imageSrc,
                    boardSize,
                    col * pieceSize,
                    row * pieceSize,
                    startPositions[i].x,
                    startPositions[i].y,
                    col * pieceSize,
                    row * pieceSize
                );
                i += 1;
            }
        }

        setMessage("Move the pieces into the correct places.");
        startTimer();
        savePuzzleProgress();
    } catch (error) {
        console.error(error);
        alert(error.message);
        setMessage("Could not load the puzzle image.");
    }
}

function loadCurrentStage() {
    state.maxHints = hintLimits[state.mode] || 0;
    state.hintsUsed = 0;
    updateHints();

    if (state.mode === "intro") {
        state.gridSize = 2;
        state.currentImageSrc = imageSets.intro[0];
        state.totalStages = 1;
        state.stageIndex = 0;
        updateHeader();
        startIntroPuzzle(state.currentImageSrc);
        return;
    }

    if (state.mode === "custom") {
        state.gridSize = state.customGridSize;
        state.currentImageSrc = state.customImageSrc;
        state.totalStages = 1;
        state.stageIndex = 0;
        updateHeader();
        startAutoPuzzle(state.currentImageSrc, state.gridSize);
        return;
    }

    state.gridSize = difficultyGrids[state.mode];
    state.currentImageSrc = imageSets[state.mode][state.stageIndex];
    state.totalStages = 3;
    updateHeader();
    startAutoPuzzle(state.currentImageSrc, state.gridSize);
}

function startGame(mode) {
    state.mode = mode;
    state.playAgainMode = mode;

    if (mode === "intro") {
        state.stageIndex = 0;
        loadCurrentStage();
        return;
    }

    if (mode === "easy" || mode === "difficult" || mode === "hard") {
        state.selectedDifficulty = mode;
        stageModeLabel.textContent = `Difficulty: ${difficultyNames[mode]}`;
        showScreen("stage");
        return;
    }

    loadCurrentStage();
}

function togglePreview() {
    if (!state.currentImageSrc) return;
    previewImage.src = state.currentImageSrc;
    previewOverlay.classList.toggle("hidden");
}

function giveHint() {
    if (state.hintsUsed >= state.maxHints) {
        setMessage("No hints left for this stage.");
        return;
    }

    const unlockedPieces = [...puzzleContainer.querySelectorAll(".puzzle-piece")]
        .filter(piece => piece.dataset.locked !== "true");

    if (unlockedPieces.length === 0) return;

    const randomPiece = unlockedPieces[Math.floor(Math.random() * unlockedPieces.length)];

    state.hintsUsed += 1;
    updateHints();

    state.moves += 1;
    updateMoves();

    lockPiece(randomPiece);
    savePuzzleProgress();
}

function handleCustomImage(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        state.customImageSrc = e.target.result;
        imagePreview.src = state.customImageSrc;
    };
    reader.readAsDataURL(file);
}

function getUsers() {
    return JSON.parse(localStorage.getItem("baliktahananUsers") || "{}");
}

function saveUsers(users) {
    localStorage.setItem("baliktahananUsers", JSON.stringify(users));
}

function savePlayerData() {
    if (!state.currentPlayer) return;
    const users = getUsers();
    if (!users[state.currentPlayer]) return;

    users[state.currentPlayer].lastPlayed = {
        mode: state.mode,
        stageIndex: state.stageIndex,
        time: state.elapsedSeconds,
        moves: state.moves
    };

    saveUsers(users);
    localStorage.setItem("baliktahananCurrentUser", state.currentPlayer);
}

function openAccountScreen(mode) {
    accountMode = mode;
    accountMessage.textContent = "";
    usernameInput.value = "";

    if (mode === "register") {
        accountTitle.textContent = "Create Username";
        accountSubtitle.textContent = "Enter a username to begin.";
    } else {
        accountTitle.textContent = "Login";
        accountSubtitle.textContent = "Enter an existing username to log in.";
    }

    showScreen("account");
    setTimeout(() => usernameInput.focus(), 50);
}

function handleAccountConfirm() {
    const username = usernameInput.value.trim();

    if (!username) {
        accountMessage.textContent = "Please enter a username.";
        return;
    }

    const users = getUsers();

    if (accountMode === "register") {
        if (users[username]) {
            accountMessage.textContent = "That username already exists. Use Login instead.";
            return;
        }

        users[username] = {
            createdAt: new Date().toISOString()
        };
        saveUsers(users);
    } else {
        if (!users[username]) {
            accountMessage.textContent = "Username not found on this device.";
            return;
        }
    }

    state.currentPlayer = username;
    localStorage.setItem("baliktahananCurrentUser", username);
    updatePlayerLabel();
    updateResumeButton();
    showScreen("difficulty");
}

startBtn.addEventListener("click", () => {
    openAccountScreen("register");
});

loginBtn.addEventListener("click", () => {
    openAccountScreen("login");
});

resumeBtn.addEventListener("click", () => {
    const savedUser = localStorage.getItem("baliktahananCurrentUser");
    if (savedUser) {
        state.currentPlayer = savedUser;
        updatePlayerLabel();
    }

    const save = getSavedPuzzle();
    if (!save) {
        alert("No saved puzzle found.");
        updateResumeButton();
        return;
    }

    restoreSavedPuzzle(save);
});

accountConfirmBtn.addEventListener("click", handleAccountConfirm);
accountBackBtn.addEventListener("click", goHome);

usernameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleAccountConfirm();
    }
});

customBtn.addEventListener("click", () => {
    const savedUser = localStorage.getItem("baliktahananCurrentUser");
    if (savedUser) {
        state.currentPlayer = savedUser;
        updatePlayerLabel();
    }
    showScreen("custom");
});

backToHome1.addEventListener("click", goHome);
backToHome2.addEventListener("click", goHome);
homeBtn.addEventListener("click", goHome);
homeBtnFinal.addEventListener("click", goHome);

backToDifficultyBtn.addEventListener("click", () => {
    showScreen("difficulty");
});

resetBtn.addEventListener("click", () => {
    clearSavedPuzzle();
    updateResumeButton();
    if (!state.mode) return;
    loadCurrentStage();
});

previewBtn.addEventListener("click", togglePreview);

previewOverlay.addEventListener("click", () => {
    previewOverlay.classList.add("hidden");
});

hintBtn.addEventListener("click", giveHint);

playAgainBtn.addEventListener("click", () => {
    if (state.playAgainMode === "custom") {
        if (!state.customImageSrc || !state.customGridSize) {
            showScreen("custom");
            return;
        }
        state.mode = "custom";
        loadCurrentStage();
        return;
    }

    if (state.playAgainMode === "intro") {
        state.mode = "intro";
        state.stageIndex = 0;
        loadCurrentStage();
        return;
    }

    if (state.playAgainMode === "easy" || state.playAgainMode === "difficult" || state.playAgainMode === "hard") {
        state.selectedDifficulty = state.playAgainMode;
        stageModeLabel.textContent = `Difficulty: ${difficultyNames[state.playAgainMode]}`;
        showScreen("stage");
        return;
    }

    goHome();
});

diffButtons.forEach(button => {
    button.addEventListener("click", () => {
        setSelectedButton(diffButtons, button);
        startGame(button.dataset.mode);
    });
});

stageButtons.forEach(button => {
    button.addEventListener("click", () => {
        if (!state.selectedDifficulty) return;
        state.mode = state.selectedDifficulty;
        state.playAgainMode = state.selectedDifficulty;
        state.stageIndex = Number(button.dataset.stage);
        loadCurrentStage();
    });
});

customDiffButtons.forEach(button => {
    button.addEventListener("click", () => {
        setSelectedButton(customDiffButtons, button);
        state.customGridSize = Number(button.dataset.size);
    });
});

imageUpload.addEventListener("change", event => {
    const file = event.target.files[0];
    handleCustomImage(file);
});

generateBtn.addEventListener("click", () => {
    if (!state.customImageSrc) {
        alert("Please upload an image first.");
        return;
    }

    if (!state.customGridSize) {
        alert("Please select a difficulty first.");
        return;
    }

    state.mode = "custom";
    state.playAgainMode = "custom";
    clearSavedPuzzle();
    updateResumeButton();
    loadCurrentStage();
});

window.addEventListener("resize", () => {
    if (!screens.game.classList.contains("active")) return;
    if (!state.mode) return;

    const save = getSavedPuzzle();
    if (save && save.mode === state.mode && state.mode !== "custom") {
        restoreSavedPuzzle(save);
    } else {
        loadCurrentStage();
    }
});

const savedUser = localStorage.getItem("baliktahananCurrentUser");
if (savedUser) {
    state.currentPlayer = savedUser;
}

updatePlayerLabel();
updateResumeButton();

const autoSave = getSavedPuzzle();

if (autoSave && state.currentPlayer && autoSave.player === state.currentPlayer) {
    restoreSavedPuzzle(autoSave);
} else {
    goHome();
}
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        savePuzzleProgress();
    }
});

window.addEventListener("beforeunload", () => {
    savePuzzleProgress();
});
