import BoardScene from './scenes/BoardScene.js';
import TitleScene from './scenes/TitleScene.js';
import InstructionsScene from './scenes/InstructionsScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import JoinRoomScene from './scenes/JoinRoomScene.js';

//Create a scene instances for all the scenes
const boardScene = new BoardScene();
const titleScene = new TitleScene();
const instructionsScene = new InstructionsScene();
const gameOverScene = new GameOverScene();
const joinRoomScene = new JoinRoomScene();

//Game Scene configration
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 1200,
    physics: {
        default: 'arcade',
        arcade: {
           debug : true
        }
    },
    backgroundColor : 0x5f6e7a,
    scale:{
        mode : Phaser.Scale.FIT,
        autoCenter : Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

//Load the scenes
game.scene.add('boardScene' , boardScene);
game.scene.add('titleScene' , titleScene);
game.scene.add('instructionsScene' , instructionsScene);
game.scene.add('gameOverScene' , gameOverScene);
game.scene.add('joinRoomScene' , joinRoomScene);

//start the first page
game.scene.start('titleScene');
