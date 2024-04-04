import { generateScenes } from './texter.js';
import { generateRepo, getAllMedia, generatePodcast, storeJson } from './media.js';
import { processScene, mergeVideo } from './processor.js';
import { Command } from 'commander';
import inquirer from 'inquirer';

const app = new Command();
async function initProcess(data) {
    console.log('initing app');
    let id = data.id;

    let scenes = generateScenes("Once upon a time, in a small town nestled amidst picturesque landscapes, there lived a young woman named Emily. From a young age, Emily harbored a deep passion for painting. She would spend hours lost in her own colorful world, creating breathtaking masterpieces that evoked emotions and touched the souls of those who beheld them.However, life had its own plans for Emily. Raised in a family that prioritized practicality over dreams, she was encouraged to pursue a more conventional path. Reluctantly, she put aside her paintbrushes and embarked on a journey toward a career in finance.Years passed, and Emily found success in her chosen profession. Yet, deep within her heart, a flicker of unfulfilled passion remained. She longed to breathe life back into her dormant creative spirit, to once again immerse herself in the world of art.One day, fate intervened when a renowned art gallery decided to host an exhibition in Emily's town. The exhibition showcased the works of talented artists from around the world. Intrigued by the opportunity to reconnect with her artistic side, Emily decided to attend the event.As she strolled through the gallery, her eyes widened in awe at the vibrant and captivating artworks on display. Each stroke of the brush, each splash of color, spoke to her soul, reigniting the fire that had long been dormant within her. Emily felt an unyielding desire to once again pick up her paintbrush and create something extraordinary.With newfound determination, Emily returned home that night and set up her own small studio. She reconnected with her artistic roots, spending every spare moment honing her skills, experimenting with different techniques, and pouring her heart and soul onto the canvas.Soon, her passion began to catch the attention of others. People in the town started noticing her breathtaking creations, and word of her talent spread like wildfire. The local art community embraced Emily, recognizing her as a gifted artist with a unique voice.As her confidence grew, Emily decided to take a leap of faith and participate in an art competition held in the nearby city. The competition was fierce, with artists from all walks of life showcasing their finest works. Doubts and insecurities tried to creep into Emily's mind, but she remained steadfast in her belief in herself and her art.The day of the competition arrived, and Emily's heart raced with anticipation. As the judges examined each artwork, Emily's painting stood out like a radiant beacon. Her use of colors, the depth of emotions conveyed, and the sheer beauty of her creation left the judges in awe.In a stunning turn of events, Emily's painting was announced as the winner of the competition. The crowd erupted in applause, celebrating her incredible talent and the journey she had embarked upon to reach this moment. It was a resounding victory, not just for Emily, but for every dreamer who had ever doubted themselves.From that day forward, Emily's art career skyrocketed. Her paintings graced the walls of prestigious galleries, and art enthusiasts from around the world sought to own a piece of her exquisite creations. Emily's story became an inspiration for aspiring artists, a reminder that it is never too late to pursue your passion and reclaim your dreams.But beyond the fame and recognition, Emily found true fulfillment in the act of creation itself. Through her art, she touched hearts, stirred emotions, and brought beauty into the world. She realized that the journey back to her passion was not just about personal fulfillment, but about making a positive impact on others.Emily's story serves as a testament to the power of perseverance, the importance of embracing one's true calling, and the incredible joy that comes from pursuing one's dreams. It reminds us all that within each of us lies a dormant spark waiting to be reignited, and that with courage and determination, we can paint our own masterpiece in the canvas of life.");
    data['dir'] = generateRepo(id);
    if (data['pod_into'] || data['pod_outro'])
        generatePodcast(data).then(d => data['podcast_output'] = d);
    scenes = await getAllMedia(data, scenes);

    for (let s of scenes) {
        let url = await processScene(s);
        s['video'] = url;
    }
    // console.log('scenes', scenes);
    data['scenes'] = scenes;

    let videoUrl = await mergeVideo(data['dir'], scenes);
    // console.log('video Url', videoUrl)
    data['video_output'] = videoUrl;
    storeJson(data);
    console.log("Process Complete", data);

};
function __main() {
    const receiver = () => {
        const questions = [
            { type: 'input', name: 'id', message: 'Video No' },
            { type: 'input', name: 'title', message: 'Enter Title for video' },
            { type: 'editor', name: 'desc', message: 'Enter Description for video' },
            { type: 'editor', name: 'content', message: 'Enter Video Script' },
            { type: 'input', name: 'pod_intro', message: 'Enter PodCast Intro' },
            { type: 'input', name: 'pod_outro', message: 'Enter PodCast Outro' },
        ]
        inquirer.prompt(questions).then(answers => {
            answers['content'] = answers['content'].replaceAll('\n', '');
            answers['desc'] = answers['desc'];
            console.log('Submitted Answers', answers);
            initProcess(answers);
        })
    }
    app
        .version('1.0.0')
        .action(receiver);
    app.parse(process.argv);
}
__main();

