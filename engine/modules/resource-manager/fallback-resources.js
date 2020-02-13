import GetFallbackImage from "./fallback-image.js";
import {TextToOctet} from "../../internal/octet-helper.js";
import audioContext from "../../internal/audio-context.js";
import ResourceTypes from "./resource-types.js";

const FAILED_RESOURCE = Symbol("FailedResource");
const FALLBACK_TEXT = "Missing resource!";
const FALLBACK_IMAGE = GetFallbackImage(FALLBACK_TEXT);
const GET_FALLBACK_JSON_OBJECT = () => {
    return {message: FALLBACK_TEXT};
};
const FALLBACK_OCTET = TextToOctet(FALLBACK_TEXT);
const FALLBACK_AUDIO = audioContext.createBuffer(
    audioContext.destination.channelCount,
    audioContext.sampleRate,audioContext.sampleRate
);

const FallbackResources = Object.freeze(Object.defineProperty({
    [FAILED_RESOURCE.description]: FAILED_RESOURCE,
    [ResourceTypes.Audio]: FALLBACK_AUDIO,
    [ResourceTypes.Image]: FALLBACK_IMAGE,
    [ResourceTypes.Text]: FALLBACK_TEXT,
    [ResourceTypes.Octet]: FALLBACK_OCTET},
    ResourceTypes.JSON,{get:GET_FALLBACK_JSON_OBJECT}
));

export default FallbackResources;
