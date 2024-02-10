const TeletypePackage = require('./lib/teletype-package')
module.exports = new TeletypePackage({
  config: atom.config,
  workspace: atom.workspace,
  notificationManager: atom.notifications,
  packageManager: atom.packages,
  commandRegistry: atom.commands,
  tooltipManager: atom.tooltips,
  clipboard: atom.clipboard,
  signalURL: atom.config.get('teletype.configSettings.signalURL'),
  pusherOptions: {
    cluster: atom.config.get('teletype.configSettings.pusherCluster'),
    disableStats: true
  },
  baseURL: atom.config.get('teletype.configSettings.baseURL'),
  getAtomVersion: atom.getVersion.bind(atom)
})
