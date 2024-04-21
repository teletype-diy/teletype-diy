### ⚠ This is beta software, expect problems. ⚠

The code will probably change and stuff will break.

# Teletype DIY for Pulsar

You might remember the teletype package for Atom.
This is a self-hosted version of it, for Pulsar.

## Never heard of Teletype. What is it?

An Pulsar package that lets developers share their workspace with team members and collaborate on code in real time.

## How is this different from the original Teletype?

The original teletype was backed by Github and as such could host a central signaling-server.
To use this package, you will either need to host a [signaling-server yourself](https://github.com/teletype-diy/signal-server) or you will need to do the signaling yourself.
Depending on your network, you may need a ICE/TURN/STUN server (e.g. [coturn](https://github.com/coturn/coturn)).
<!-- If you only have access to a IPv4 address behind a NAT, you will very probably also need a ICE/TURN/STUN server. -->

## FAQ

### What will get shared?

Teletype-DIY will only share the buffers/files that are currently open in your editor instance.
Packages that use the Teletype-DIY API might extend this, such as [teletype-tree-view](https://github.com/teletype-diy/teletype-tree-view).

### How to do the manual signal exchange

1. Enable 'direct p2p' in settings
1. Connect like normal
1. Follow instructions in signal-pane: copy signal to peers.




<!--
An Atom package that lets developers share their workspace with team members and collaborate on code in real time.

Learn more at [teletype.atom.io](https://teletype.atom.io).

![demo](https://user-images.githubusercontent.com/2988/32753167-d781baf0-c899-11e7-8b64-683ab84d3a8c.gif)

## Installation

### Command Line

1. Install [Atom 1.22](https://atom.io) or newer
2. In the terminal, install the package via apm:

    ```sh
    apm install teletype
    ```

### GUI

1. Install [Atom 1.22](https://atom.io) or newer
1. Launch Atom
1. Open Settings View using <kbd>Cmd+,</kbd> on macOS or <kbd>Ctrl+,</kbd> on other platforms
1. Click the Install tab on the left side
1. Enter `teletype` in the search box and press <kbd>Enter</kbd>
1. Click the "Install" button that appears

## Hacking

This package is powered by three main components:

- [teletype-crdt](https://github.com/atom/teletype-crdt): The string-wise sequence CRDT that enables peer-to-peer collaborative editing.
- [teletype-server](https://github.com/atom/teletype-server): The server-side application that facilitates peer discovery.
- [teletype-client](https://github.com/atom/teletype-client): The editor-agnostic library that manages the interaction with other clients.

### Dependencies

To run teletype tests locally, you'll first need to have:

- Atom 1.22 or later
- Node 7+
- PostgreSQL 9.x

### Running locally

1. Clone and bootstrap

    ```
    git clone https://github.com/atom/teletype.git
    cd teletype
    createdb teletype-test
    apm install
    ```

2. Run the tests

    ```
    atom --test test
    ```
-->
