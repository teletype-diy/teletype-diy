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
  peerConnectionTimeout: atom.config.get('teletype-diy.configSettings.timeout'),
  getAtomVersion: atom.getVersion.bind(atom)
})
