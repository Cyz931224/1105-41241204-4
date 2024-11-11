let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let countdownTimer; // 用於倒數計時的變數
let failureCount = 0; // 用於計算失敗次數
let maxFailures = 0; // 最大失敗次數

// 音效檔案
const successSound = new Audio('success.mp3'); // 成功音效
const failureSound = new Audio('failure.mp3'); // 失敗音效

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('play-again-button').addEventListener('click', resetGame);
    document.getElementById('difficulty').addEventListener('change', updateDifficultyDescription);
});

function updateDifficultyDescription() {
    const difficulty = document.getElementById('difficulty').value;
    const description = document.getElementById('difficulty-description');

    if (difficulty === 'easy') {
        description.innerText = "簡單模式：無限翻牌直到贏";
    } else if (difficulty === 'normal') {
        description.innerText = "普通模式：玩家只能有3次翻牌失誤";
    } else if (difficulty === 'hard') {
        description.innerText = "困難模式：只會顯示一半的卡片，且玩家只能有3次翻牌失誤";
    }
}

function startGame() {
    // 隱藏初始介面
    document.getElementById('start-screen').style.display = 'none';

    cards = [];
    matchedPairs = 0;
    failureCount = 0; // 重置失敗計數
    document.getElementById('congrats-message').classList.add('hidden');
    document.getElementById('countdown').classList.remove('hidden'); // 顯示倒數計時器

    const boardSize = parseInt(document.getElementById('board-size').value);
    const totalCards = boardSize * boardSize; // 根據選擇的大小計算卡片數量
    const imageType = document.getElementById('image-type').value; // 獲取選擇的圖片類型
    const displayTime = parseInt(document.getElementById('time-display').value); // 獲取顯示時間
    const totalImages = 36; // 總共的圖片數量
    let images = [];

    // 根據選擇的難度設置最大失敗次數
    const difficulty = document.getElementById('difficulty').value;
    if (difficulty === 'easy') {
        maxFailures = Infinity; // 簡單模式：無限制
    } else if (difficulty === 'normal') {
        maxFailures = 3; // 普通模式：3次失敗
    } else {
        maxFailures = 3; // 困難模式：3次失敗
    }

    // 生成圖片路徑
    for (let i = 1; i <= totalImages; i++) {
        images.push(`41241204/${i}.png`); // 假設圖片命名為 1.png, 2.png, ..., 36.png
    }

    // 根據選擇的圖片類型選擇相應的圖片
    let selectedImages = [];
    if (imageType === 'animals') {
        selectedImages = getRandomImages(images.slice(0, 18), boardSize === 2 ? 2 : (boardSize === 4 ? 8 : 18)); // 動物圖片
    } else if (imageType === 'people') {
        selectedImages = getRandomImages(images.slice(18, 36), boardSize === 2 ? 2 : (boardSize === 4 ? 8 : 18)); // 人物圖片
    }

    // 創建配對的圖片
    const imagesToUse = [...selectedImages, ...selectedImages]; // 創建配對
    cards = shuffle(imagesToUse); // 打亂

    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = ''; // 清空之前的卡片

    // 設置遊戲板的行和列
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 120px)`;

    cards.forEach((image) => {
        const cardElement = createCard(image);
        gameBoard.appendChild(cardElement);
    });

    // 在困難模式下，根據選擇的大小隨機顯示正面卡片
    if (document.getElementById('difficulty').value === 'hard') {
        if (boardSize === 2) {
            showRandomCards(2); // 顯示 2 張正面
        } else if (boardSize === 4) {
            showRandomCards(8); // 顯示 8 張正面
        } else if (boardSize === 6) {
            showRandomCards(18); // 顯示 18 張正面
        }
    } else {
        // 在簡單和普通模式下，顯示所有卡片正面
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('flipped');
        });
    }

    // 倒數計時顯示
    let timeRemaining = displayTime;
    document.getElementById('timer').innerText = timeRemaining;

    countdownTimer = setInterval(() => {
        timeRemaining--;
        document.getElementById('timer').innerText = timeRemaining;
        if (timeRemaining <= 0) {
            clearInterval(countdownTimer);
            // 顯示正面時間結束後翻回背面
            document.querySelectorAll('.card').forEach(card => {
                if (!card.classList.contains('matched')) {
                    card.classList.remove('flipped');
                }
            });
            document.getElementById('countdown').classList.add('hidden'); // 隱藏倒數計時器
        }
    }, 1000); // 每秒更新一次
}

function resetGame() {
    // 顯示初始介面
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('game-board').innerHTML = ''; // 清空遊戲板
    document.getElementById('countdown').classList.add('hidden'); // 隱藏倒數計時器
    document.getElementById('congrats-message').classList.add('hidden'); // 隱藏通關訊息
}

function getRandomImages(images, count) {
    const shuffled = shuffle([...images]); // 打亂圖片
    return shuffled.slice(0, count); // 返回前 count 張圖片
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCard(image) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
        <div class="card-inner" onclick="flipCard(this)">
            <div class="card-front">
                <img src="41241204/37.png" alt="背面圖片"> <!-- 背面圖片 -->
            </div>
            <div class="card-back">
                <img src="${image}" alt="正面圖片">
            </div>
        </div>
    `;
    return card;
}

function showRandomCards(count) {
    const cardsToShow = document.querySelectorAll('.card');
    const shuffledCards = shuffle([...cardsToShow]); // 隨機打亂卡片

    // 隨機顯示不重複的正面卡片
    shuffledCards.slice(0, count).forEach(card => {
        card.classList.add('flipped'); // 顯示正面
    });
}

function flipCard(cardInner) {
    if (lockBoard) return;
    const card = cardInner.parentElement;

    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');

    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        lockBoard = true;

        // 如果兩張卡片圖片相同，標記為配對成功
        if (firstCard.innerHTML === secondCard.innerHTML) {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            matchedPairs++;
            successSound.play(); // 播放成功音效

            resetBoard();

            // 檢查是否所有配對完成
            if (matchedPairs === (cards.length / 2)) { // 根據卡片數量判斷
                showCongratsMessage();
            }

        } else {
            failureCount++; // 增加失敗計數
            failureSound.play(); // 播放失敗音效
            if (failureCount >= maxFailures) {
                showGameOverMessage(); // 顯示遊戲失敗訊息
            } else {
                setTimeout(() => {
                    firstCard.classList.remove('flipped');
                    secondCard.classList.remove('flipped');
                    resetBoard();
                }, 1000); // 1秒後翻回背面
            }
        }
    }
}

function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function showCongratsMessage() {
    document.getElementById('congrats-message').classList.remove('hidden'); // 顯示通關訊息
}

function showGameOverMessage() {
    const messageElement = document.getElementById('congrats-message');
    messageElement.innerHTML = "<h2 style='color: red;'>遊戲失敗！</h2><button id='play-again-button'>再玩一次</button>";
    messageElement.classList.remove('hidden'); // 顯示遊戲失敗訊息
    document.getElementById('play-again-button').addEventListener('click', resetGame); // 設置再玩一次按鈕的事件
}