# Remix IDE Slither Plugin

### Requirements
* Slither > 0.3.1

### Install 

#### Slither

```console
$ pip install slither-analyzer
```

#### Upgrade Sliter

```console
$ pip install slither-analyzer --upgrade
```

### Install Remix plugin

Source

```bash
$ git clone https://github.com/samparsky/remix-plugin-slither.git
$ npm install
$ npm start
```

NPM
```console
$ npm install -g remix-slither-plugin
```

### Start

```sh
$ slitherd -h

Usage: slitherd [options]

Options:
  -V, --version  output the version number
  -p, --port     Server port
  -h, --help     output usage information
```

```sh
$ slitherd

    Go in Remix ( https://remix.ethereum.org / https://remix-alpha.ethereum.org ) / settings tab,
    under the Plugin section paste the following declaration:

    {
        "title": "slitherd",
        "url": "http://127.0.0.1:8000"
    }

    Then start the plugin by licking on its icon.
```

You change the port by passing the `-p <port>` flag

```sh
$ slitherd -p 9000

    Go in Remix ( https://remix.ethereum.org / https://remix-alpha.ethereum.org ) / settings tab,
    under the Plugin section paste the following declaration:

    {
        "title": "slitherd",
        "url": "http://127.0.0.1:9000"
    }

    Then start the plugin by licking on its icon.
```


You can run the remix slither plugin in dev mode to make it ignore
the slither version

```sh
$ slitherd -d
    
    Running in dev mode

    Go in Remix ( https://remix.ethereum.org / https://remix-alpha.ethereum.org ) / settings tab,
    under the Plugin section paste the following declaration:

    {
        "title": "slitherd",
        "url": "http://127.0.0.1:8000"
    }

    Then start the plugin by licking on its icon.
```


License
-------
MIT
