function getPortalURIwithPeerId (portalId, peerId) {
  return 'atom://teletype/portal/' + portalId + '/' +peerId
}

function getPortalURI (portalId) {
  return 'atom://teletype/portal/' + portalId
}

function getEditorURI (portalId, editorProxyId) {
  return getPortalURI(portalId) + '/editor/' + editorProxyId
}

module.exports = {getEditorURI, getPortalURI, getPortalURIwithPeerId}
