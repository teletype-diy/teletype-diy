const {TeletypeClient, Errors} = require('@teletype-diy/teletype-diy-client')
const {CompositeDisposable} = require('atom')
const PortalBindingManager = require('./portal-binding-manager')
const PortalStatusBarIndicator = require('./portal-status-bar-indicator')
const AuthenticationProvider = require('./authentication-provider')
const CredentialCache = require('./credential-cache')
const TeletypeService = require('./teletype-service')
const SignalView = require('./signal-view')
const {findPortalId, findPeerId} = require('./portal-id-helpers')
const JoinViaExternalAppDialog = require('./join-via-external-app-dialog')

module.exports =
class TeletypePackage {
  constructor (options) {
    const {
      config, clipboard, commandRegistry, credentialCache, getAtomVersion,
      notificationManager, packageManager, peerConnectionTimeout, pubSubGateway,
      signalURL, tetherDisconnectWindow, tooltipManager,
      workspace
    } = options

    this.config = config
    this.workspace = workspace
    this.notificationManager = notificationManager
    this.packageManager = packageManager
    this.commandRegistry = commandRegistry
    this.tooltipManager = tooltipManager
    this.clipboard = clipboard
    this.pubSubGateway = pubSubGateway
    this.signalURL = signalURL
    this.getAtomVersion = getAtomVersion
    this.peerConnectionTimeout = peerConnectionTimeout
    this.tetherDisconnectWindow = tetherDisconnectWindow
    this.credentialCache = credentialCache || new CredentialCache()
    this.client = new TeletypeClient({
      signalURL: this.signalURL,
      pubSubGateway: this.pubSubGateway,
      connectionTimeout: this.peerConnectionTimeout,
      tetherDisconnectWindow: this.tetherDisconnectWindow
    })
    this.client.onConnectionError(this.handleConnectionError.bind(this))
    this.portalBindingManagerPromise = null
    this.joinViaExternalAppDialog = new JoinViaExternalAppDialog({config, commandRegistry, workspace})
    this.subscriptions = new CompositeDisposable()
    // Signal view to display and input manually transmitted signal without signal server
    this.signalView = new SignalView((signal) => {
        this.client.peerPool.injectExternalSignal(signal);
    });
    this.client.signalBufferLocal.setupBufferCallback((signal) => {
        const encryptCompressSignal = this.client.peerPool.signalCrypt.encryptCompress(signal);
        this.signalView.updateSignal(encryptCompressSignal);
    })
  }

  activate () {
    console.log('teletype: Using signal URL:', this.signalURL)

    this.subscriptions.add(this.commandRegistry.add('atom-workspace.teletype-Authenticated', {
      'teletype:sign-out': () => this.signOut()
    }))
    this.subscriptions.add(this.commandRegistry.add('atom-workspace', {
      'teletype:share-portal': () => this.sharePortal()
    }))
    this.subscriptions.add(this.commandRegistry.add('atom-workspace', {
      'teletype:join-portal': () => this.joinPortal()
    }))
    this.subscriptions.add(this.commandRegistry.add('teletype-RemotePaneItem', {
      'teletype:leave-portal': () => this.leavePortal()
    }))
    this.subscriptions.add(this.commandRegistry.add('atom-workspace.teletype-Host', {
      'teletype:copy-portal-url': () => this.copyHostPortalURI()
    }))
    this.subscriptions.add(this.commandRegistry.add('atom-workspace.teletype-Host', {
      'teletype:close-portal': () => this.closeHostPortal()
    }))
    // TODO: move signal buffer stuff here.
    this.subscriptions.add(this.commandRegistry.add('atom-workspace', {
      'teletype:inject-signal-from-clipboard': () => this.injectSignal()
    }))

    this.subscriptions.add(this.commandRegistry.add('atom-workspace', {
      'teletype:copy-own-signal-to-clipboard': () => this.copySignalToClipboard()
    }))

    this.subscriptions.add(this.commandRegistry.add('atom-workspace', {
      'teletype:toggle-signal-pane': () => this.toggleSignalView()
    }))

    this.subscriptions.add(atom.workspace.addOpener(uri => {
       if (uri === 'atom://teletype-diy/signal-view') {
         return this.signalView;
       }
     })),

    // Initiate sign-in, which will continue asynchronously, since we don't want
    // to block here.
    this.signInUsingSavedToken()
    this.registerRemoteEditorOpener()
  }

  // TODO: this is crap.
  injectSignal () {
    //
    const message = atom.clipboard.read();
    this.client.peerPool.injectExternalSignal(message);
  }

  copySignalToClipboard () {
    //
    const signal = this.client.getSignal();
    atom.clipboard.write(signal);
    this.signalView.updateSignal(signal);
  }

  toggleSignalView () {
    atom.workspace.toggle('atom://teletype-diy/signal-view');
  }

  async deactivate () {
    this.initializationError = null

    this.subscriptions.dispose()
    this.subscriptions = new CompositeDisposable()

    if (this.portalStatusBarIndicator) this.portalStatusBarIndicator.destroy()

    if (this.portalBindingManagerPromise) {
      const manager = await this.portalBindingManagerPromise
      await manager.dispose()
    }
  }

  async handleURI (parsedURI, rawURI) {
    const portalId = findPortalId(parsedURI.pathname) || rawURI
    const remotePeerId = findPeerId(parsedURI.pathname)

    if (this.config.get('teletype.askBeforeJoiningPortalViaExternalApp')) {
      const {EXIT_STATUS} = JoinViaExternalAppDialog

      const status = await this.joinViaExternalAppDialog.show(rawURI)
      switch (status) {
        case EXIT_STATUS.CONFIRM_ONCE:
          return this.joinPortal(portalId, remotePeerId)
        case EXIT_STATUS.CONFIRM_ALWAYS:
          this.config.set('teletype.askBeforeJoiningPortalViaExternalApp', false)
          return this.joinPortal(portalId, remotePeerId)
        default:
          break
      }
    } else {
      return this.joinPortal(portalId, remotePeerId)
    }
  }

  async sharePortal () {
    this.showPopover()

    if (await this.isSignedIn()) {
      const manager = await this.getPortalBindingManager()
      const portalBinding = await manager.createHostPortalBinding()
      if (portalBinding) return portalBinding.portal
    }
  }

  // TODO: Add remotePeerId here too, forgot it in 92e919f
  // remotePeerId is added to share uri now, every caller needs to supply it...
  // still needs testing, how does url handleing works again?
  async joinPortal (id, remotePeerId) {
    this.showPopover()

    if (await this.isSignedIn()) {
      if (id && remotePeerId) {
        const manager = await this.getPortalBindingManager()
        const portalBinding = await manager.createGuestPortalBinding(id, remotePeerId)
        if (portalBinding) return portalBinding.portal
      } else {
        await this.showJoinPortalPrompt()
      }
    }
  }

  async closeHostPortal () {
    this.showPopover()

    const manager = await this.getPortalBindingManager()
    const hostPortalBinding = await manager.getHostPortalBinding()
    hostPortalBinding.close()
  }

  async copyHostPortalURI () {
    const manager = await this.getPortalBindingManager()
    const hostPortalBinding = await manager.getHostPortalBinding()
    atom.clipboard.write(hostPortalBinding.uri)
  }

  async leavePortal () {
    this.showPopover()

    const manager = await this.getPortalBindingManager()
    const guestPortalBinding = await manager.getActiveGuestPortalBinding()
    guestPortalBinding.leave()
  }

  provideTeletype () {
    return new TeletypeService({teletypePackage: this})
  }

  async consumeStatusBar (statusBar) {
    const teletypeClient = await this.getClient()
    const portalBindingManager = await this.getPortalBindingManager()
    const authenticationProvider = await this.getAuthenticationProvider()
    this.portalStatusBarIndicator = new PortalStatusBarIndicator({
      statusBar,
      teletypeClient,
      portalBindingManager,
      authenticationProvider,
      isClientOutdated: this.isClientOutdated,
      initializationError: this.initializationError,
      tooltipManager: this.tooltipManager,
      commandRegistry: this.commandRegistry,
      clipboard: this.clipboard,
      workspace: this.workspace,
      notificationManager: this.notificationManager,
      packageManager: this.packageManager,
      getAtomVersion: this.getAtomVersion
    })

    this.portalStatusBarIndicator.attach()
  }

  registerRemoteEditorOpener () {
    this.subscriptions.add(this.workspace.addOpener((uri) => {
      if (uri.startsWith('atom://teletype/')) {
        return this.getRemoteEditorForURI(uri)
      } else {
        return null
      }
    }))
  }

  async getRemoteEditorForURI (uri) {
    const portalBindingManager = await this.getPortalBindingManager()
    if (portalBindingManager && await this.isSignedIn()) {
      return portalBindingManager.getRemoteEditorForURI(uri)
    }
  }

  async signInUsingSavedToken () {
    const authenticationProvider = await this.getAuthenticationProvider()
    if (authenticationProvider) {
      return authenticationProvider.signInUsingSavedToken()
    } else {
      return false
    }
  }

  async signOut () {
    const authenticationProvider = await this.getAuthenticationProvider()
    if (authenticationProvider) {
      this.portalStatusBarIndicator.showPopover()
      await authenticationProvider.signOut()
    }
  }

  async isSignedIn () {
    const authenticationProvider = await this.getAuthenticationProvider()
    if (authenticationProvider) {
      return authenticationProvider.isSignedIn()
    } else {
      return false
    }
  }

  showPopover () {
    if (!this.portalStatusBarIndicator) return

    this.portalStatusBarIndicator.showPopover()
  }

  async showJoinPortalPrompt () {
    if (!this.portalStatusBarIndicator) return

    const {popoverComponent} = this.portalStatusBarIndicator
    const {portalListComponent} = popoverComponent.refs
    await portalListComponent.showJoinPortalPrompt()
  }

  handleConnectionError (event) {
    const message = 'Connection Error'
    const description = `An error occurred with a teletype connection: <code>${event.message}</code>`
    this.notificationManager.addError(message, {
      description,
      dismissable: true
    })
  }

  getAuthenticationProvider () {
    if (!this.authenticationProviderPromise) {
      this.authenticationProviderPromise = new Promise(async (resolve, reject) => {
        const client = await this.getClient()
        if (client) {
          resolve(new AuthenticationProvider({
            client,
            credentialCache: this.credentialCache,
            notificationManager: this.notificationManager,
            workspace: this.workspace
          }))
        } else {
          this.authenticationProviderPromise = null
          resolve(null)
        }
      })
    }

    return this.authenticationProviderPromise
  }

  getPortalBindingManager () {
    if (!this.portalBindingManagerPromise) {
      this.portalBindingManagerPromise = new Promise(async (resolve, reject) => {
        const client = await this.getClient()
        if (client) {
          resolve(new PortalBindingManager({
            client,
            workspace: this.workspace,
            notificationManager: this.notificationManager
          }))
        } else {
          this.portalBindingManagerPromise = null
          resolve(null)
        }
      })
    }

    return this.portalBindingManagerPromise
  }

  async getClient () {
    if (this.initializationError) return null
    if (this.isClientOutdated) return null

    try {
      await this.client.initialize()
      return this.client
    } catch (error) {
      if (error instanceof Errors.ClientOutOfDateError) {
        this.isClientOutdated = true
      } else {
        this.initializationError = error
      }
    }
  }
}
