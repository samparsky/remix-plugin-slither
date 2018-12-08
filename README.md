# Remix IDE Slither Plugin


### Install 

#### Slither

```console
$ pip install slither-analyzer
```

Install Remix plugin

```console
$ npm install -g remix-slitherd
```

### Start

```console
$ slitherd -p 8080

    Go in Remix ( https://remix.ethereum.org / https://remix-alpha.ethereum.org ) / settings tab,
    under the Plugin section paste the following declaration:

    {
        "title": "slither anaylsis",
        "url": "http://127.0.0.1:8000"
    }

    Then start the plugin by licking on its icon.
```