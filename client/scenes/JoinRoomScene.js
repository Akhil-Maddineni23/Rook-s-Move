class JoinRoomScene extends Phaser.Scene {

    constructor(){
        super({ key : 'joinRoomScene'});
    }

    init(data){
        this.cameras.main.setBackgroundColor('#000000');
    }

    preload(){
        console.log('This is Join Room Scene');
        this.load.image('submitButton', 'assets/images/submit-button.png');
    }

    create(data) {
        
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

        // Take player Name and roomID from the windows prompt screen
        const playerName = window.prompt('Enter your Name:');
        const roomID = window.prompt('Enter your room ID:');

        
        // Display player Name and his room ID
        this.add.text(100, 100, `Name: ${playerName}`,thickTextStyle);
        this.add.text(100, 250, `Room ID: ${roomID}`, thickTextStyle1);

        // submit button to start playing the game
        this.submitButton = this.add.image(600 , 700 , 'submitButton');
        this.submitButton.setInteractive({ useHandCursor : true});
        this.submitButton.on('pointerdown' , ()=> this.clickedSubmitButton(playerName , roomID)); 
    }

    clickedSubmitButton(playerName , roomID){
        this.scene.start('boardScene' , {playerName , roomID});
    }

    update(time , delta){
    } 
}

export default JoinRoomScene;