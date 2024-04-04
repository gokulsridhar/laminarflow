import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename) + '/';
import pexels from './config/pexels.json' assert { type: "json"};
import gtts from './config/gtts.json' assert { type: "json"};
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import axios from 'axios';
import download from 'download';
import fs from 'fs';

const client = new TextToSpeechClient();

async function downloadMediaFromPexel(path, video, i) {
    let hd = video['video_files'].find(({ width, height }) => width >= 1280 && height >= 720);

    await download(hd['link'], path, { filename: 'stock_video_0' + i + '.mp4' })
    return path + 'stock_video_0' + i + '.mp4';
}

export function getPexelMedia(path, s, i) {
    const query = s.keywords.slice(0, Math.min(pexels.keywordsCount, s.keywords.length)).join(',');

    return axios.get(pexels.api_url + 'search', {
        params: {
            query,
            orientation: 'landscape',
            per_page: pexels.mediaCount,
        },
        headers: {
            Authorization: pexels.api_key,
        },
    }).then(response => {
        console.log('Downloading video No: ' + (i + 1));
        s['pexels'] = response['data']['videos'];
        return downloadMediaFromPexel(path, response.data.videos[0], i);
    });
}

async function generateSpeech(path, { text }, i) {
    return new Promise((resolve, reject) => {

        const request = {
            input: { text },
            ...gtts.video
        };

        client.synthesizeSpeech(request, (err, response) => {
            if (err) {
                return reject(err);
            }
            if (!fs.existsSync(path))
                fs.mkdirSync(path, { recursive: true });
            // Write the binary audio content to a file
            fs.writeFile(path + `audio_0${i}.mp3`, response.audioContent, 'binary', err => {
                if (err) {
                    return reject(err);
                }

                return resolve(path + `audio_0${i}.mp3`);
            });
        });
    });
}
export async function getMediaContent(dir, s) {


    let stock_video = await getPexelMedia(`${dir}videos/`, s, s['id']);
    let audio = await generateSpeech(`${dir}audios/`, s, s['id']);
    console.log({ stock_video, audio });
    return { stock_video, audio };
}

export async function getAllMedia({ dir }, scenes) {
    for (let s of scenes) {
        const { stock_video, audio } = await getMediaContent(dir, s);
        s['stock_video'] = stock_video;
        s['audio'] = audio;
    }
    return scenes;
}
export function generateRepo(id) {
    let dir = `${__dirname}Content/vid-${id}/`;
    if (fs.existsSync(dir))
        fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

export function storeJson(json) {
    fs.writeFileSync(json['dir'] + '0_content.json', JSON.stringify(json), 'utf8');
}

export async function generatePodcast(data) {
    return new Promise((resolve, reject) => {
        const text = data['pod_intro'] + ' ' + data['content'] + ' ' + data['pod_outro'];
        if(text.endsWith('.')) 
            text.splice(text.length -1, 1);
        const request = {
            input: { text:text.trim() },
            ...gtts.podcast
        };

        client.synthesizeSpeech(request, (err, response) => {
            if (err) {
                return reject(err);
            }
            if (!fs.existsSync(data['dir']))
                fs.mkdirSync(data['dir'], { recursive: true });
            // Write the binary audio content to a file
            fs.writeFile(data['dir'] + `podcast_output.mp3`, response.audioContent, 'binary', err => {
                if (err) {
                    return reject(err);
                }

                return resolve(data['dir'] + `podcast_output.mp3`);
            });
        });
    });
}