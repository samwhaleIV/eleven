# eleven

Eleven is a game engine for the web. I know what you're thinking: **"Wow, what a unique idea."** Currently only modern Chromium based browsers are supported (*Google Chrome*, *Chromium Edge*, *Electron*, etc).


Eleven aims to do everything that *Elven* could do, but better in every way possible.

## Getting Started

To get started you will need **two** things: Your project and a copy of the engine.
 
These will reside in folders `engine` and `my-project` that share the same `root` directory. This can be anywhere but for security and semantical reasons it should be an isolated directory only containing contents of Eleven engine and related runtime components. Using all the contents of this repository may not be necessary for your needs, only the `engine` folder is required to create this demo project.

Your project folder should include an html file such as `index.html`.

To use the engine you'll also need your own JavaScript file, let's say `script.js`.

```
root
│
├── engine
│   ├── eleven.js
│   └── eleven.css
│    
└── my-project
     ├── index.html
     └── script.js
```

To register the engine with your project you must include the [master export file](../engine/eleven.js) (`engine/eleven.js`) and it is strongly recommended to link the [CSS file](../engine/eleven.css) because the engine expects elements to conform to these sizing rules.

```html
<head>
    <link href="../engine/eleven.css" rel="stylesheet">
    <script src="../engine/eleven.js" type="module"></script>
</head>
```
When using your own `script.js` file be sure to specify the `type` attribute with `module` or you will not be able to access any modules of the master export namespace (`Eleven` or `globalThis.Eleven`).

```html
<body>
    <script src="script.js" type="module"></script>
</body>
 ```

An already made copy of `my-project` following this guide can be [found here](../my-project/).

## Namespaces & Modules

Namespaces and modules are the foundation of the Eleven engine. They allow for maximum component reusage and cross-compatibility, even between different projects.

TODO: Write this section... YEEEEEEEEEEEEET
