import audioContext from "../../internal/audio-context.js";

const CHANNEL_MISMATCH = (countA,countB) => {
    throw Error(`Channel count mismatch (${countA} and ${countB}) between merging audio buffers.`);
};
const SAMPLE_RATE_MISMATCH = (rateA,rateB) => {
    throw Error(`Sample rate mismatch (${rateA} and ${rateB}) between merging audio buffers.`);
};
const checkMatch = (a,b,failure) => {
    if(a !== b) failure(a,b);
};

function MergeAudioBuffers(bufferA,bufferB) {

    /*
      It would be wise to use this function inside a promise/other asynchronous wrapper,
      but I'm not going to tell you how you should live your life. #yolo
    */

    const channelCountA = bufferA.numberOfChannels;
    const channelCountB = bufferB.numberOfChannels;

    const sampleRateA = bufferA.sampleRate;
    const sampleRateB = bufferB.sampleRate;

    checkMatch(channelCountA,channelCountB,CHANNEL_MISMATCH);
    checkMatch(sampleRateA,sampleRateB,SAMPLE_RATE_MISMATCH);

    const lengthA = bufferA.length;
    const lengthB = bufferB.length;

    const totalLength = lengthA + lengthB;

    const sampleRate = sampleRateA;
    const channelCount = channelCountA;

    const audioBuffer = audioContext.createBuffer(
        channelCount,totalLength,sampleRate
    );

    for(let channel = 0;channel<channelCount;channel++) {
        const bufferData = audioBuffer.getChannelData(channel);
        bufferA.copyFromChannel(bufferData,channel,0);
        bufferB.copyFromChannel(bufferData,channel,lengthA);
    }

    const loopStart = lengthA / totalLength * audioBuffer.duration;

    resolve({audioBuffer,loopStart});
}

function InstallIntroHelper(target) {
    target.MergeAudioBuffers = MergeAudioBuffers;
}
export default InstallIntroHelper;
