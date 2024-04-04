import { generateScenes } from './texter.js';
import { generateRepo, getAllMedia, generatePodcast, storeJson } from './media.js';
import { processScene, mergeVideo } from './processor.js';
import { Command } from 'commander';
import inquirer from 'inquirer';
import scenesJson from './scenes.json' assert {type:'json'}

const app = new Command();
async function initProcess(data) {
    console.log('initing app');
    // let id = data.id;

    // let scenes = generateScenes(data.content);
    // data['dir'] = generateRepo(id);
    // if (data['pod_into'] || data['pod_outro'])
    //     generatePodcast(data).then(d => data['podcast_output'] = d);
    // scenes = await getAllMedia(data, scenes);
    let scenes = scenesJson;
    data['dir'] = '/Users/gokulsridhar/sandbox/laminarflow/Content/vid-01/';
    // for (let s of scenes) {
    //     let url = await processScene(s);
    //     s['video'] = url;
    // }
    // console.log('scenes', scenes);
    // data['scenes'] = scenes;


    let videoUrl = await mergeVideo(data['dir'], scenes);
    // let videoUrl = await mergeVideo('/Users/gokulsridhar/sandbox/laminarflow/Content/vid-01/', scenes);
    console.log('video Url', videoUrl)
    // data['video_output'] = videoUrl;
    // storeJson(data);
    console.log("End time", new Date().toString())

};
function __main() {
    const receiver = () => {
        console.log("Start time", new Date().toString())
        // const questions = [
        //     { type: 'input', name: 'id', message: 'Video No' },
        //     { type: 'input', name: 'title', message: 'Enter Title for video' },
        //     { type: 'editor', name: 'desc', message: 'Enter Description for video' },
        //     { type: 'editor', name: 'content', message: 'Enter Video Script' },
        //     { type: 'input', name: 'pod_intro', message: 'Enter PodCast Intro' },
        //     { type: 'input', name: 'pod_outro', message: 'Enter PodCast Outro' },
        // ]
        // inquirer.prompt(questions).then(answers => {
        //     answers['content'] = answers['content'].replaceAll('\n', '');
        //     answers['desc'] = answers['desc'];
        //     console.log('Answers', answers);
        //     initProcess(answers);
        // })
        initProcess({});
    }
    app
        .version('1.0.0')
        .action(receiver);
    app.parse(process.argv);
}
__main();

