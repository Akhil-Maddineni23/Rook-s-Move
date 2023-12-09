class TitleScene extends Phaser.Scene {
    constructor(){
        super({ key : 'titleScene'});
    }

    // this data argument is parameters passed to the scene from the another scene
    init(data){
        this.cameras.main.setBackgroundColor('#000000');
    }

    preload(){
        console.log('This is Title Scene');
        this.load.image('gameTitle', 'assets/images/Game-Name.jpg');
        this.load.image('startButton', 'assets/images/start-button.png');
        this.load.image('instructions', 'assets/images/instructions.jpeg');
    }

    create(data) {
        //Adding game title image to scene
        this.gameTitle = this.add.sprite(0, 0, 'gameTitle');
        this.gameTitle.x = 600;
        this.gameTitle.y = 300;

        //Adding game start button to the scene
        this.startButton = this.add.image(600 , 700 , 'startButton');
        this.startButton.setInteractive({ useHandCursor : true});
        this.startButton.on('pointerdown' , ()=> this.clickedStartButton());

        //Adding instructions button to the scene
        this.instructions = this.add.image(600 , 900 , 'instructions');
        this.instructions.setInteractive({ useHandCursor : true});
        this.instructions.on('pointerdown' , ()=> this.clickedInstructionsButton());
    }

    update(time , delta){
    }

    clickedStartButton(){
        this.scene.start('joinRoomScene');
    }

    clickedInstructionsButton(){
        this.scene.start('instructionsScene');
    }
}

export default TitleScene;