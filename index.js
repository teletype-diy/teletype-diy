const TeletypePackage = require('./lib/teletype-package')
module.exports = new TeletypePackage({
  config: atom.config,
  workspace: atom.workspace,
  notificationManager: atom.notifications,
  packageManager: atom.packages,
  commandRegistry: atom.commands,
  tooltipManager: atom.tooltips,
  clipboard: atom.clipboard,
  signalURL: atom.config.get('teletype-diy.configSettings.signalURL'),
  pusherOptions: {
    cluster: atom.config.get('teletype-diy.configSettings.pusherCluster'),
    disableStats: true
  },
  // TODO: remove baseURL
  baseURL: "",
  getAtomVersion: atom.getVersion.bind(atom)
})
