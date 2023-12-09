class GameOverScene extends Phaser.Scene {

    constructor(shared){
        super({ key : 'gameOverScene'});
        this.shared = shared;
    }

    init(data){
        this.cameras.main.setBackgroundColor('#000000');
        this.hasWon = data.winner;
        this.roomID = data.roomID;
        
        this.socket = this.shared.socket;
    }

    preload(){
        console.log('This is Game Over Scene');
        this.load.image('playAgain', 'assets/images/play-again.jpeg');
        this.load.image('exitGame', 'assets/images/exit-game.jpg');
    }

    create() {
        const thickTextStyle = {
            fontFamily: 'Arial',
            fontSize: 100,
            color: '#ff0000', // Red color
            stroke: '#000000', 
            strokeThickness: 25, 
        };

        const thickTextStyle1 = {
            fontFamily: 'Arial',
            fontSize: 100,
            color: '#0000ff', // Blue color
            stroke: '#000000', 
            strokeThickness: 8, 
        };

        this.add.text(300, 100, 'Game Over!.', thickTextStyle);

        // displaying the result of the game
        if(this.hasWon){
            this.add.text(100, 300, "Congrats!..You Won!.", thickTextStyle1);
        }else{
            this.add.text(100, 300, "Sorry!..You Lost!..", thickTextStyle1);

        }
        
        // Adding playagain to take player to the main page
        this.playAgain = this.add.image(600 , 600 , 'playAgain');
        this.playAgain.setInteractive({ useHandCursor : true});
        this.playAgain.on('pointerdown' , ()=> this.clickedPlayAgainButton());

        // Adding exit game image
        this.exitGame = this.add.image(600 , 900 , 'exitGame');
        this.exitGame.setInteractive({ useHandCursor : true});
        this.exitGame.on('pointerdown' , ()=> this.clickedExitGameButton());
    }

    clickedPlayAgainButton(){
        this.scene.start('boardScene');
    }

    clickedExitGameButton(){
        this.socket.emit('exitGame');
        this.scene.start('titleScene');
    }

    update(time , delta){
    } 
}

export default GameOverScene;