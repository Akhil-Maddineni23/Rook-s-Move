class BoardScene extends Phaser.Scene {
    constructor(shared) {
        super({ key: 'boardScene' });
        this.shared = shared;
    }

    init(data) {
        this.cameras.main.setBackgroundColor('#ffffff');

        //rook start and target locations
        this.rookCurrent = { row: 0, col: 7 };
        this.rookTarget = { row: 7, col: 0 };

        //initial game and players status
        this.gameStarted = false;
        this.localPlayerStatus = 'online';
        this.opponentPlayerStatus = 'offline';
        

        //Establishing socket connection to the server
        //this.socket = io('http://localhost:3000');
        this.socket = this.shared.socket;
       
        //Intial , current time in seconds
        this.initialTime = 21; 
        this.currentTime = this.initialTime; 
        this.timerText = null;
        this.turnTimer = null;

        // By default player turn  = false
        // Because server decides who will play first
        this.yourTurn = false;
    }

    preload() {
        console.log('This is Board Scene');
        this.load.image('chess-boardImage', 'assets/images/grid.png');
        this.load.image('white', 'assets/images/white (1).png');
        this.load.image('black', 'assets/images/black (1).png');
        this.load.image('target', 'assets/images/target-1.svg');
        this.load.image('rook', 'assets/images/rook.png');
    }

    showNotYourTurnText() {
        const thickTextStyle1 = {
            fontFamily: 'Arial',
            fontSize: 100,
            color: '#0000ff',
            stroke: '#000000', 
            strokeThickness: 25, 
            fontWeight: 'bold'
        };
        
        // Create the text
        const notYourTurnText = this.add.text(300, 500, `It's not your turn`, thickTextStyle1);

        // Add tweens directly
        this.tweens.add({
            targets: notYourTurnText,
            alpha: 1,
            duration: 500, // Fade in duration
            ease: 'Power2',
            onComplete: () => {
                // Keep the text visible for 1 second
                this.time.delayedCall(1000, () => {
                    // Fade out and destroy after 1 second
                    this.tweens.add({
                        targets: notYourTurnText,
                        alpha: 0,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            notYourTurnText.destroy();
                        }
                    });
                });
            }
        });


    }

    create(data) {
        // Add an time event with delay
        this.turnTimer = this.time.addEvent({
            delay: 1000, // 1 second
            callback: this.updateTimer,
            callbackScope: this,
            loop: true,
        });

        // Get the entered playerName and his roomId entered in the previous scene
        const { playerName , roomID} = data;
        this.rID = roomID;
        this.pName = playerName;

        //set the game scene -> playername , room id , timer , opponent status
        this.displayGameDetails(playerName , roomID)

        //create the 8x8 chess grid with rook and target images placed 
        this.createGrid();

        // Join the room
        this.socket.emit('joinRoom', { roomID , playerName});

        // Listen notYourTurn event
        this.socket.on('notYourTurn', () => {
            this.showNotYourTurnText();
        })

        // Listen for 'playerMove' events from the server
        this.socket.on('playerMove', (data) => {
            const { player, targetPosition } = data;
            // Move the opponent's piece on the board
            this.moveRook(targetPosition.row, targetPosition.col);
        });

        // Listen for the turn change event
        this.socket.on('turnChange' , (data) => {
            const { isTurn } = data;
            this.yourTurn = isTurn;
            this.yourTurnText.setText(`Your Turn: ${this.yourTurn}`);

            if(this.yourTurn){
                // When it's your turn - display a timer of 20seconds
                this.currentTime = this.initialTime;
                this.updateTimer();
            }else{
                this.timerText.setVisible(false);
            } 
        })

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
            this.scene.start('gameOverScene' , { winner: winner , roomID : this.rID });
        });
        
        //Start the game only if when both players become online
        this.socket.on('opponentStatus', (data) => {
            console.log('opponent status event received:');
            this.opponentPlayerStatus = data.status;
            this.yourTurn = data.isTurn;
            if (this.opponentPlayerStatus === 'online') {
                this.oppenentStatusText.setText(`Opponent Status: ${this.opponentPlayerStatus}`);

                this.yourTurnText.setVisible(true);
                this.yourTurnText.setText(`Your Turn: ${this.yourTurn}`);
                this.gameStarted = true;
            } else {
                console.log("Waiting for both players to come online...");
            }
        });
    };

    updateTimer() {
        if (this.gameStarted && this.yourTurn) {
            this.currentTime -= 1;
            this.timerText.setVisible(true);
            this.timerText.setText(`Time: ${this.currentTime}`);
    
            if (this.currentTime <= 0) {
                this.socket.emit('gameOver', {
                    roomID : this.rID,
                    targetReached : false
                });
                return 
            }
        }
    }

    createGrid(){
        const gridSize = 8;
        const cellSize = 100;
        const borderWidth = 10;

        //Placing the grid by leaving equal amount of space on all sides
        const xOffset = (this.sys.game.config.width - gridSize * cellSize) / 2;
        const yOffset = (this.sys.game.config.height - gridSize * cellSize) / 2;

        //store each cell references
        this.cellArray = [];

        // Building the 8x8 checks with Black and White check boxes images
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                this.cellArray[row] = [];
                // placing each with reference from the offset
                const x = xOffset + col * cellSize;
                const y = yOffset + row * cellSize;

                const key = (row + col) % 2 === 0 ? 'white' : 'black';

                // displaying image of cellsize
                const imageCell = this.add.image(x, y, key).setOrigin(0, 0).setDisplaySize(cellSize, cellSize);

                const graphics = this.add.graphics();
                graphics.lineStyle(borderWidth, 0xFF0000);
                graphics.strokeRect(x, y, cellSize, cellSize);


                this.cellArray[row][col] = imageCell;

                // Add event listener to each cell
                imageCell.setInteractive();
                
                //On click of the mouse on the cells
                imageCell.on('pointerdown', (pointer) => {
                    if (this.gameStarted && this.yourTurn) {

                        if (row === this.rookTarget.row && col === this.rookTarget.col) {
                            this.socket.emit('gameOver', {
                                roomID : this.rID,
                                targetReached : true
                            });
                            return 
                        }

                        // player should move either in the same col or same row
                        // player should not go back and always should move towards his left
                        if ((row === this.rookCurrent.row || col === this.rookCurrent.col) && (row > this.rookCurrent.row || col < this.rookCurrent.col)) {
                            // Move the rook locally for player1
                            this.moveRook(row, col);

                            // Emit player1 move to the server
                            this.socket.emit('playerMove', {
                                player: this.currentPlayer,
                                targetPosition: { row, col },
                                roomID : this.rID
                            });
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
        this.oppenentStatusText = this.add.text(200, 100, `Opponent Status: ${this.opponentPlayerStatus}`, thickTextStyle3);
        this.yourTurnText = this.add.text(800, 100, `Your Turn: ${this.yourTurn}`, thickTextStyle3)
        .setVisible(false);
       
        const timerTextStyle = { fontFamily: 'Arial', fontSize: 50, color: '#FFFFFF' };
        this.timerText = this.add.text(1000, 50, 'Time: 20', timerTextStyle)
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
                //here this points to the object scene
                this.rookCurrent = { row: row, col: col };
            },
        });
    }
}

export default BoardScene;
