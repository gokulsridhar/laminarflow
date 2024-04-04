import { getAudioDurationInSeconds } from 'get-audio-duration';
import { exec } from 'child_process';
import Ffmpeg from 'fluent-ffmpeg';
import util from 'util';
const runner = util.promisify(exec);

export function processText({text}, time) {
  let lines = splitText(text);
  // :alpha='if(lt(t,0),0,if(lt(t,0.5),(t-0)/0.5,if(lt(t,${time-((lines.length - i)*0.5)}),1,if(lt(t,${time}),(1-(t-${time-((lines.length - i)*0.5)}))/1,0))))'
  lines =lines.map((l,i) => `drawtext=font=Poppins:text='${l}':box=1:boxborderw=15:boxcolor=#4C4C6D:x=(w-text_w)/2:y=h-(text_h*${(lines.length - i) *2}):fontsize=58:fontcolor=#E8F6EF`)
    return lines.join(',');    

}

function generateFFMPEGCommand(scene, time) {

  let cmd = `ffmpeg  -i "${scene['audio']}" -stream_loop -1 -i "${scene['stock_video']}" -vf "[in]scale=1920:1080,`
  cmd += processText(scene, time);
  cmd += `[out]" -shortest -map 0:a:0 -map 1:v:0  -pix_fmt yuv420p -vcodec libx264 -y ${scene['stock_video'].replace('stock_', '')}`
  return cmd;
}

function splitText(text) {
  const maxLineLength = 55;
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';


  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (currentLine.length + word.length <= maxLineLength) {
      // Add the word to the current line
      currentLine += (currentLine.length > 0 ? ' ' : '') + word;
    } else {
      // Start a new line with the word
      lines.push(currentLine);
      currentLine = word;
    }
  }

  // Add the last line
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}


export async function processScene(scene) {
  return new Promise(async (resolve, reject) => {
    try {
  let time = await getAudioDurationInSeconds(scene['audio']);
      console.log('time', time)
      let cmd = generateFFMPEGCommand(scene, time);
      console.log('Scene Command ' + scene['id'], cmd)
      const { stderr } = await runner(cmd);
    console.log('Scene Processed successfully');
      // if(stderr) {
      //   console.log('Error in processing scene' + scene['id'] ,stderr)
      //   return reject(stderr);
      // }
     return resolve(scene['stock_video'].replace('stock_', ''));

    } catch (err) {
      reject(err)
    }
  });
} 

// export async function processScene(scene) {
//   let time = await getAudioDurationInSeconds(scene['audio']);
//   let lines = splitText(scene['text']);

//   return new Promise((resolve, reject) => {
//     let filters = [
//       {
//         filter: 'scale',
//         options: {
//           w: '1980',
//           h: '1080'
//         },
//         inputs: 0,
//         outputs: 'rescaled'
//       }
//     ];
//     lines.forEach((l, i) => {
//       filters.push({
//         filter: 'drawtext',
//         options: {
//           font: 'Poppins',
//           text: l,
//           fontcolor: "#e84118",
//           fontsize: 58,
//           x: "(w-text_w)/2",
//           y: `h-(text_h*${(lines.length - i) * 2})`,
//           box: 1,
//           boxborderw: 15,
//           boxcolor: "#353b48",
//           alpha: `if(lt(t,0),0,if(lt(t,0.5),(t-0)/0.5,if(lt(t,${time - ((lines.length - i) * 0.5)}),1,if(lt(t,${time}),(1-(t-${time - ((lines.length - i) * 0.5)}))/1,0))))`
//         },
//         inputs: !i ? 'rescaled' : `vid-${i - 1}`,
//         outputs: i >= (lines.length - 1) ? 'output' : `vid-${i}`
//       })
//     })
//     Ffmpeg(scene['stock_video']).input(scene['audio']).inputOptions("-stream_loop -1")
//       .complexFilter(filters, 'output').outputOptions(["-shortest", "-map 0:v:0", "-map 1:a:0"])
//       .output(scene['stock_video'].replace('stock_', ''))
//       .on('error', err => {
//         console.log('errr process ' + JSON.stringify(scene), err);
//         reject(err);
//       }).on('end', d => { console.log('FFMPEG Processed ===>', scene['id']); return resolve(scene['stock_video'].replace('stock_', '')) })
//       .run()
//   });
// }

// export async function mergeVideo(dir, scenes) {
//   // ffmpeg -i "video_00.mp4" -i "video_01.mp4" -filter_complex "[0:v:0][0:a:0][1:v:0][1:a:0]concat=n=3:v=1:a=1[v][a]" -map "[v]" -map "[a]" -vsync 2 "output.mp4"
//   return new Promise((resolve, reject) => {
//     try {
//       const out = `${dir}generated.mp4`
//       let cmd = 'ffmpeg ';
//       scenes.forEach(s => {
//         cmd += `-i "${s['video']}" `
//       });
//       cmd += `-filter_complex "${scenes.map((s, i) => `[${i}:v:0][${i}:a:0]`).join('')}concat=n=${scenes.length}:v=1:a=1[v][a]" -map "[v]" -map "[a]" -vsync 2 ${out}"`;
//       console.log('Merge command', cmd)
//       let proc = exec(cmd)
//       proc.stdout.on('data', (d) => console.log(d));
//       proc.stderr.setEncoding("utf8")
//       proc.stderr.on('error', err => console.log(err));
//       proc.on('close', (d) => resolve(out));
//     } catch (err) {
//       reject(err)
//     }
//   });
// } 

// export async function mergeVideo(dir, scenes) {
//   return new Promise((resolve, reject) => {
//     try {
//       const out = `${dir}generated.mp4`
//       console.log('out', out);
//       let cmd = Ffmpeg();
//       scenes.forEach(s => {
//         cmd.addInput(s['video']);
//       })
//       cmd.complexFilter([`${scenes.map((s, i) => `[${i}:v:0][${i}:a:0]`).join('')}concat=n=${scenes.length}:v=1:a=1[v][a]`], ['v', 'a'])
//         .outputOptions(["-map v", "-map a", "-vsync 2"])
//         .output(out).on('error', err => {
//           console.log('errr merge', err);
//           reject(err);
//         }).on('end', d => resolve(out))
//         .run()
//     } catch (err) {
//       reject(err)
//     }
//   });
// }



export async function mergeVideo(dir, scenes) {
  // ffmpeg -i "video_00.mp4" -i "video_01.mp4" -filter_complex "[0:v:0][0:a:0][1:v:0][1:a:0]concat=n=3:v=1:a=1[v][a]" -map "[v]" -map "[a]" -vsync 2 "output.mp4"
  return new Promise(async (resolve, reject) => {
    try {
      const out = `${dir}generated.mp4`
      let cmd = 'ffmpeg ';
      scenes.forEach(s => {
        cmd += `-i "${s['video']}" `
      });
      cmd += `-i "/Users/gokulsridhar/sandbox/laminarflow/Content/static/outro.mp4" -filter_complex "${scenes.map((s, i) => `[${i}:v:0][${i}:a:0]`).join('')}[${scenes.length}:v:0][${scenes.length}:a:0]concat=n=${scenes.length+1}:v=1:a=1[v][a]" -map "[v]" -map "[a]" -vsync 2 "${out}"`;
      console.log('Merge command', cmd)
      const { stdout, stderr } = await runner(cmd);
    console.log('All videos merged successfully');
    console.log('FFmpeg output:', stdout);

     return resolve(out);

    } catch (err) {
      reject(err)
    }
  });
} 
