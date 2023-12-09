class InstructionsScene extends Phaser.Scene {

    constructor(){
        super({ key : 'instructionsScene'});
    }

    init(data){
        this.cameras.main.setBackgroundColor('#000000');
    }

    preload(){
        console.log('This is Instructions Scene');
        this.load.image('backButton', 'assets/images/back-button.png');
    }

    create(data) {
        const thickTextStyle = {
            fontFamily: 'Arial',
            fontSize: 60,
            color: '#ff0000', // Red color
            stroke: '#000000', // Stroke color
            strokeThickness: 8, // Thickness of the stroke
        };

        const thickTextStyle1 = {
            fontFamily: 'Arial',
            fontSize: 50,
            color: '#0000ff', // Blue color
            stroke: '#000000', // Stroke color
            strokeThickness: 8, // Thickness of the stroke
        };
        this.add.text(100, 50, 'Game Rules:', thickTextStyle);

        const textLines = [
            '1. The game will be played on 8x8 chessboard.',
            '2. There will be two players, and they will take',
            'turns to move the rook. Rooks starts from the top right square.',
            '3. On each turn, a player can move the rook any',
            'number of steps to the left or down, but not up,',
            'right or diagonally.',
            '4. The player who reaches the bottom-left corner',
            'of the board first wins the game.'
        ]

        // Position for the first line
        let x = 100;
        let y = 150;

        // Create text objects for each line
        textLines.forEach((line) => {
            const text = this.add.text(x, y, line, thickTextStyle1);
           
            // Increase the Y position for the next line
            y += 100
        });

        this.backButton = this.add.image(600 , 1050 , 'backButton');
        this.backButton.setInteractive({ useHandCursor : true});
        this.backButton.on('pointerdown' , ()=> this.clickedBackButton());
    }

    clickedBackButton(){
        this.scene.start('titleScene');
    }

    update(time , delta){
    } 
}

export default InstructionsScene;