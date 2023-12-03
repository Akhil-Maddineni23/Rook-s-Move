class GameOverScene extends Phaser.Scene {

    constructor(){
        super({ key : 'gameOverScene'});
    }

    init(data){
        this.cameras.main.setBackgroundColor('#000000');
        this.hasWon = data.winner;
        console.log(this.hasWon);
    }

    preload(){
        console.log('This is Game Over Scene');
        this.load.image('playAgain', 'assets/play-again.jpeg');
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
    }

    clickedPlayAgainButton(){
        this.scene.start('titleScene');
    }

    update(time , delta){
    } 
}

export default GameOverScene;