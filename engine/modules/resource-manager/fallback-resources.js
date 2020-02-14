import GetFallbackImage from "./fallback-image.js";
import audioContext from "../../internal/audio-context.js";
import ResourceTypes from "./resource-types.js";

const FAILED_RESOURCE = Symbol("FailedResource");
const FALLBACK_TEXT = "Missing resource!";
const FALLBACK_IMAGE = GetFallbackImage(FALLBACK_TEXT);
const FALLBACK_JSON = `{"message": "${FALLBACK_TEXT}"}`;

const FALLBACK_BINARY = new ArrayBuffer(0);
const FALLBACK_AUDIO = audioContext.createBuffer(
    audioContext.destination.channelCount,
    audioContext.sampleRate,audioContext.sampleRate
);

const FallbackResources = Object.freeze({
    [FAILED_RESOURCE.description]: FAILED_RESOURCE,
    [ResourceTypes.Audio]: FALLBACK_AUDIO,
    [ResourceTypes.Image]: FALLBACK_IMAGE,
    [ResourceTypes.Text]: FALLBACK_TEXT,
    [ResourceTypes.Binary]: FALLBACK_BINARY,
    [ResourceTypes.JSON]: FALLBACK_JSON
});

export default FallbackResources;
