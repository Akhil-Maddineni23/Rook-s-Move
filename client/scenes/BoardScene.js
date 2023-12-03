class BoardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'boardScene' });
    }

    init(data) {
        this.cameras.main.setBackgroundColor('#ffffff');

        //rook start and target locations
        this.rookCurrent = { row: 0, col: 7 };
        this.rookTarget = { row: 7, col: 0 };

        //initial game and players status
        this.opponentPlayerStatus = 'offline';
        this.localPlayerStatus = 'online';
        this.gameStarted = false;

        //Establishing socket connection to the server
        this.socket = io('http://localhost:3000');
        

        //Intial , current time in seconds
        this.initialTime = 30; 
        this.currentTime = this.initialTime; 
        this.timerText = null;
        this.turnTimer = null;

        // Set the starting player (can be 'player1' or 'player2')
         // Calculate the opponent player
        this.currentPlayer = 'player1'; 
        this.opponentPlayer = this.currentPlayer === 'player1' ? 'player2' : 'player1';
    }

    preload() {
        console.log('This is Board Scene');
        this.load.image('chess-boardImage', 'assets/grid.png');
        this.load.image('white', 'assets/whites/white (1).png');
        this.load.image('black', 'assets/blacks/black (1).png');
        this.load.image('target', 'assets/target-1.svg');
        this.load.image('rook', 'assets/rook.png');
    }

    create(data) {
        // Get the entered playerName and his roomId entered in the previous scene
        const { playerName , roomID} = data;
        this.rID = roomID;


        //set the game scene -> playername , room id , timer , opponent status
        this.displayGameDetails(playerName , roomID)
        //create the 8x8 chess grid, rook, target 
        this.createGrid();

        // Join the room
        this.socket.emit('joinRoom', { roomID });

        // Listen for 'playerMove' events from the server
        this.socket.on('playerMove', (data) => {
            const { player, targetPosition } = data;
            // Move the opponent's piece on the board
            this.moveRook(targetPosition.row, targetPosition.col);

            // Reset the timer when the opponent makes a move
            this.currentTime = this.initialTime;
        });

        //check the gameResult got from the server and send the status to the GameResult screen
        this.socket.on('gameResult' , (data) =>{
            const {senderSocketID , targetReached} = data;
            let winner;
            if(targetReached){
                if(this.socket.id === senderSocketID){
                    winner = true;
                }else{
                    winner = false;
                }
            }else{
                if(this.socket.id === senderSocketID){
                    winner = false;
                }else{
                    winner = true;
                }
            }
            this.scene.start('gameOverScene' , { winner });
        });
        

        //Start the game only if when both players become online
        this.socket.on('opponentStatus', (data) => {
            this.opponentPlayerStatus = data.status;
            if (this.opponentPlayerStatus === 'online' & this.localPlayerStatus === 'online') {
                this.oppenentStatusText.setText(`Opponent Status: ${this.opponentPlayerStatus}`);
                this.gameStarted = true;
            } else {
                console.log("Waiting for both players to come online...");
            }
        });

        // Add an time event with delay
        this.turnTimer = this.time.addEvent({
            delay: 1000, // 1 second
            callback: this.updateTimer,
            callbackScope: this,
            loop: true,
        });
    };

    updateTimer() {
        if (this.gameStarted) {
            this.currentTime -= 1;
            this.timerText.setText(`Time: ${this.currentTime}`);
    
            if (this.currentTime <= 0) {
                this.socket.emit('gameOver', {
                    roomID : this.rID,
                    targetReached : false
                });
                return 
            }
            const isLocalPlayerTurn = this.isLocalPlayerTurn();
            this.timerText.setVisible(isLocalPlayerTurn);
        }
    }

    isLocalPlayerTurn() {
        return this.currentPlayer === 'player1';
    }

    createGrid(){
        const gridSize = 8;
        const cellSize = 100;
        const borderWidth = 10;

        const xOffset = (this.sys.game.config.width - gridSize * cellSize) / 2;
        const yOffset = (this.sys.game.config.height - gridSize * cellSize) / 2;

        this.cellArray = [];

        // Building the 8x8 checks with Black and White check boxes images
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                this.cellArray[row] = [];
                const x = xOffset + col * cellSize;
                const y = yOffset + row * cellSize;

                const key = (row + col) % 2 === 0 ? 'white' : 'black';

                const imageCell = this.add.image(x, y, key).setOrigin(0, 0).setDisplaySize(cellSize, cellSize);

                const graphics = this.add.graphics();
                graphics.lineStyle(borderWidth, 0xFF0000);
                graphics.strokeRect(x, y, cellSize, cellSize);

                this.cellArray[row][col] = imageCell;

                // Add event listener to each cell
                imageCell.setInteractive();
                
                //On click of the mouse on the cells
                imageCell.on('pointerdown', (pointer) => {
                    if (this.gameStarted) {

                        if (row === this.rookTarget.row && col === this.rookTarget.col) {
                            this.socket.emit('gameOver', {
                                roomID : this.rID,
                                targetReached : true
                            });
                            return 
                        }

                        if (this.currentPlayer === 'player1' && (row === this.rookCurrent.row || col === this.rookCurrent.col) && (row > this.rookCurrent.row || col < this.rookCurrent.col)) {
                            // Move the rook locally for player1
                            this.moveRook(row, col);
                            this.currentTime = this.initialTime;
            
                            // Emit player1 move to the server
                            this.socket.emit('playerMove', {
                                player: this.currentPlayer,
                                targetPosition: { row, col },
                                roomID : this.rID
                            });
            
                            // Switch to the next player's turn
                            this.currentPlayer = 'player2';
                        } else if (this.currentPlayer === 'player2' && (row === this.rookCurrent.row || col === this.rookCurrent.col) && (row > this.rookCurrent.row || col < this.rookCurrent.col)) {
                            // Move the rook locally for player2
                            this.moveRook(row, col);
                            this.currentTime = this.initialTime;
            
                            // Emit player2 move to the server
                            this.socket.emit('playerMove', {
                                player: this.currentPlayer,
                                targetPosition: { row, col },
                                roomID : this.rID
                            });
            
                            // Switch to the next player's turn
                            this.currentPlayer = 'player1';
                        }
                    } 
                });
            }
        }

        //Adding rook image at (0,7)
        this.rook = this.add.image(xOffset + 7 * cellSize, yOffset + 0 * cellSize, 'rook')
            .setOrigin(0, 0)
            .setDisplaySize(cellSize, cellSize);
        this.rookPrevious = { row: 0, col: 7 }

        //Adding target image at (7,0)
        const finalTarget = this.add.image(xOffset + 0 * cellSize, yOffset + 7 * cellSize, 'target')
            .setOrigin(0, 0)
            .setDisplaySize(cellSize, cellSize); 
    }

    displayGameDetails(playerName , roomID){
        this.boardimage = this.add.sprite(0, 0, 'chess-boardImage');
        this.boardimage.setScale(4, 4);
        this.boardimage.x = 1000 / 2;
        this.boardimage.y = 1000 / 2;

        const thickTextStyle1 = {
            fontFamily: 'Arial',
            fontSize: 50,
            color: '#ff0000', // Red color
            stroke: '#000000', 
            strokeThickness: 25, 
            fontWeight: 'bold'
        };

        const thickTextStyle2 = {
            fontFamily: 'Arial',
            fontSize: 50,
            color: '#0000ff', // Blue color
            stroke: '#000000', 
            strokeThickness: 8, 
            fontWeight: 'bold'
        };
        const thickTextStyle3 = {
            fontFamily: 'Arial',
            fontSize: 50,
            color: '#00FF00', // Green color
            stroke: '#000000', 
            strokeThickness: 8, 
            fontWeight: 'bold'
        };

        this.Name = playerName;
        this.add.text(100, 50, `${playerName}`, thickTextStyle1);
        this.add.text(400, 50, `Room ID: ${roomID}`, thickTextStyle2);
        this.oppenentStatusText = this.add.text(300, 100, `Opponent Status: ${this.opponentPlayerStatus}`, thickTextStyle3);

        const timerTextStyle = { fontFamily: 'Arial', fontSize: 50, color: '#FFFFFF' };
        this.timerText = this.add.text(1000, 50, 'Time: 30', timerTextStyle)
        .setOrigin(0.5, 0)
        .setVisible(false); // Hide the timer initially
    }

    moveRook(row, col) {
        const cellSize = 100;
        const xOffset = (this.sys.game.config.width - 8 * cellSize) / 2;
        const yOffset = (this.sys.game.config.height - 8 * cellSize) / 2;

        const x = xOffset + col * cellSize;
        const y = yOffset + row * cellSize;

        this.tweens.add({
            targets: this.rook,
            x: x,
            y: y,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.rookCurrent = { row: row, col: col };
            },
        });
    }
}

export default BoardScene;
