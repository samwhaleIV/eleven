import DecodeImageResponse from "./image-decode.js";
import audioContext from "../../internal/audio-context.js";
import ResourceTypes from "./resource-types.js";

const ResourceLoaders = Object.freeze({
    [ResourceTypes.Audio]: response => {
        return response.arrayBuffer().then(arrayBuffer => {
            return audioContext.decodeAudioData(arrayBuffer);
        });
    },
    [ResourceTypes.Image]: DecodeImageResponse,
    [ResourceTypes.Text]: response => {
        return response.text();
    },
    [ResourceTypes.JSON]: response => {
        return response.text();
    },
    [ResourceTypes.Binary]: response => {
        return response.arrayBuffer();
    }
});
export default ResourceLoaders;
