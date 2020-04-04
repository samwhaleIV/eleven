You're probably wondering what the fuck all those variable names are. This is for you. Made with love.

* `p`: particle / particle data buffer `Array.isArray(p) === true`.

    This is an array containing the particle data buffer

* `i`: Particle array index

    When following `p`, this is the start point to read and write into the particle data buffer.

*  `y` & `x`: X/Y position in pixels (offset from center of emitter render).

*  `xv` & `yv`: Horizontal/vertical velocity/range

*  `d`: Delta second `zero to one`

    A fraction of a single second. This is a normalized frame delta.

*  `t`: Time normal `zero to one`

    A fraction of the particle emitter duration.

*  `tf`: Generic time function
*  `xt` & `yt`: Horizontal/vertical time function

    Horizontal and vertical time input `t` and output a velocity scalar. `t = 1; t => t / 2; t === 0.5; x += xv * d * t`
