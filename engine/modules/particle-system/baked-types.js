import RainbowRain from "./types/rainbow-rain.js";

const InstallBakedTypes = (installers => target =>
    installers.forEach(installer => installer.call(target))
)([
    RainbowRain
]);

export default InstallBakedTypes;
