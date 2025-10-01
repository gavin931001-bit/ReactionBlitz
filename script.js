/**
 * 反應速度測試遊戲
 * 完整的 JavaScript 實作
 */

// 遊戲狀態管理
const GameStates = {
    START: 'start',
    WAITING: 'waiting',
    READY: 'ready',
    RESULT: 'result',
    ERROR: 'error'
};

// 遊戲類別
class ReactionGame {
    constructor() {
        // 遊戲狀態
        this.currentState = GameStates.START;
        this.startTime = null;
        this.reactionTime = null;
        this.waitTimeout = null;
        this.bestScore = this.loadBestScore();
        
        // DOM 元素
        this.body = document.body;
        this.startButton = document.getElementById('start-button');
        this.gameArea = document.getElementById('game-area');
        this.gameStatus = document.getElementById('game-status');
        this.gameInstructions = document.getElementById('game-instructions');
        this.resultContainer = document.getElementById('result-container');
        this.reactionTimeElement = document.getElementById('reaction-time');
        this.resultMessage = document.getElementById('result-message');
        this.playAgainButton = document.getElementById('play-again-button');
        this.bestScoreElement = document.getElementById('best-score');
        
        // 初始化遊戲
        this.init();
    }
    
    /**
     * 初始化遊戲，綁定事件監聽器
     */
    init() {
        // 顯示最佳紀錄
        this.updateBestScoreDisplay();
        
        // 綁定按鈕事件
        this.startButton.addEventListener('click', () => this.startGame());
        this.playAgainButton.addEventListener('click', () => this.resetGame());
        
        // 綁定全域點擊事件（用於遊戲區域點擊）
        this.body.addEventListener('click', (e) => this.handleBodyClick(e));
        
        // 設定初始狀態
        this.setState(GameStates.START);
        
        console.log('反應速度遊戲已初始化');
    }
    
    /**
     * 從 localStorage 載入最佳紀錄
     */
    loadBestScore() {
        const saved = localStorage.getItem('reactionGameBestScore');
        return saved ? parseInt(saved) : null;
    }
    
    /**
     * 儲存最佳紀錄到 localStorage
     */
    saveBestScore(score) {
        localStorage.setItem('reactionGameBestScore', score.toString());
        this.bestScore = score;
    }
    
    /**
     * 更新最佳紀錄顯示
     */
    updateBestScoreDisplay() {
        this.bestScoreElement.textContent = this.bestScore ? `${this.bestScore}ms` : '--';
    }
    
    /**
     * 設定遊戲狀態
     */
    setState(newState) {
        // 清除之前的狀態 class
        Object.values(GameStates).forEach(state => {
            this.body.classList.remove(state);
        });
        
        // 設定新狀態
        this.currentState = newState;
        this.body.classList.add(newState);
        
        // 根據狀態更新 UI
        this.updateUI();
        
        console.log(`遊戲狀態變更為: ${newState}`);
    }
    
    /**
     * 根據當前狀態更新 UI
     */
    updateUI() {
        // 隱藏所有元素
        this.startButton.style.display = 'none';
        this.gameStatus.style.display = 'none';
        this.gameInstructions.style.display = 'none';
        this.resultContainer.classList.remove('show');
        
        switch (this.currentState) {
            case GameStates.START:
                this.startButton.style.display = 'block';
                break;
                
            case GameStates.WAITING:
                this.gameStatus.style.display = 'block';
                this.gameInstructions.style.display = 'block';
                this.gameStatus.textContent = '準備中...';
                this.gameInstructions.textContent = '等待背景變成綠色';
                break;
                
            case GameStates.READY:
                this.gameStatus.style.display = 'block';
                this.gameInstructions.style.display = 'block';
                this.gameStatus.textContent = '點擊！';
                this.gameInstructions.textContent = '盡快點擊畫面任何地方';
                break;
                
            case GameStates.RESULT:
                this.resultContainer.classList.add('show');
                break;
                
            case GameStates.ERROR:
                this.gameStatus.style.display = 'block';
                this.gameInstructions.style.display = 'block';
                this.gameStatus.textContent = '😅 太快了！';
                this.gameInstructions.textContent = '等待背景變成綠色再點擊';
                
                // 3 秒後自動重置
                setTimeout(() => {
                    this.resetGame();
                }, 3000);
                break;
        }
    }
    
    /**
     * 開始遊戲
     */
    startGame() {
        console.log('遊戲開始');
        
        // 清除之前的計時器
        if (this.waitTimeout) {
            clearTimeout(this.waitTimeout);
        }
        
        // 設定等待狀態
        this.setState(GameStates.WAITING);
        
        // 隨機等待 1-3 秒
        const waitTime = Math.random() * 2000 + 1000; // 1000-3000ms
        console.log(`等待時間: ${waitTime.toFixed(0)}ms`);
        
        this.waitTimeout = setTimeout(() => {
            // 只有在等待狀態才切換到準備狀態（避免玩家太早點擊時的狀態衝突）
            if (this.currentState === GameStates.WAITING) {
                this.startTime = Date.now();
                this.setState(GameStates.READY);
                console.log('背景變綠，開始計時');
            }
        }, waitTime);
    }
    
    /**
     * 處理 body 點擊事件
     */
    handleBodyClick(event) {
        // 避免按鈕點擊觸發此事件
        if (event.target.tagName === 'BUTTON') {
            return;
        }
        
        switch (this.currentState) {
            case GameStates.WAITING:
                // 太早點擊
                this.handleEarlyClick();
                break;
                
            case GameStates.READY:
                // 計算反應時間
                this.handleReactionClick();
                break;
        }
    }
    
    /**
     * 處理太早點擊
     */
    handleEarlyClick() {
        console.log('玩家太早點擊');
        
        // 清除等待計時器
        if (this.waitTimeout) {
            clearTimeout(this.waitTimeout);
            this.waitTimeout = null;
        }
        
        // 設定錯誤狀態
        this.setState(GameStates.ERROR);
    }
    
    /**
     * 處理反應點擊
     */
    handleReactionClick() {
        if (!this.startTime) {
            console.error('開始時間未設定');
            return;
        }
        
        // 計算反應時間
        const endTime = Date.now();
        this.reactionTime = endTime - this.startTime;
        
        console.log(`反應時間: ${this.reactionTime}ms`);
        
        // 檢查是否為最佳紀錄
        const isNewRecord = !this.bestScore || this.reactionTime < this.bestScore;
        if (isNewRecord) {
            this.saveBestScore(this.reactionTime);
            this.updateBestScoreDisplay();
            console.log('新紀錄！');
        }
        
        // 顯示結果
        this.showResult(this.reactionTime, isNewRecord);
        
        // 設定結果狀態
        this.setState(GameStates.RESULT);
    }
    
    /**
     * 顯示結果
     */
    showResult(time, isNewRecord) {
        // 顯示反應時間
        this.reactionTimeElement.textContent = `${time}ms`;
        
        // 生成結果訊息
        const message = this.getResultMessage(time, isNewRecord);
        this.resultMessage.textContent = message;
    }
    
    /**
     * 根據反應時間生成結果訊息
     */
    getResultMessage(time, isNewRecord) {
        let message = '';
        
        // 根據時間給予評價
        if (time < 200) {
            message = '🚀 超快反應！';
        } else if (time < 300) {
            message = '⚡ 反應很棒！';
        } else if (time < 500) {
            message = '👍 表現不錯！';
        } else {
            message = '🐌 還有進步空間';
        }
        
        // 如果是新紀錄，添加祝賀訊息
        if (isNewRecord) {
            message += '\n🎉 新紀錄！';
        }
        
        return message;
    }
    
    /**
     * 重置遊戲
     */
    resetGame() {
        console.log('重置遊戲');
        
        // 清除計時器
        if (this.waitTimeout) {
            clearTimeout(this.waitTimeout);
            this.waitTimeout = null;
        }
        
        // 重置遊戲變數
        this.startTime = null;
        this.reactionTime = null;
        
        // 回到開始狀態
        this.setState(GameStates.START);
    }
}

// 當 DOM 載入完成後初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 載入完成，初始化反應速度遊戲');
    
    // 建立遊戲實例
    window.reactionGame = new ReactionGame();
    
    console.log('遊戲已準備就緒！');
});

// 防止頁面重新整理時的確認對話框（在開發時很有用）
window.addEventListener('beforeunload', (event) => {
    // 只在遊戲進行中時顯示確認對話框
    if (window.reactionGame && 
        (window.reactionGame.currentState === GameStates.WAITING || 
         window.reactionGame.currentState === GameStates.READY)) {
        event.preventDefault();
        event.returnValue = '遊戲正在進行中，確定要離開嗎？';
    }
});
