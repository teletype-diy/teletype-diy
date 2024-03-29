module.exports =
class TeletypeService {
  constructor ({teletypePackage}) {
    this.teletypePackage = teletypePackage
  }

  async getRemoteEditors () {
    const portalBindingManager = await this.teletypePackage.getPortalBindingManager()
    if (portalBindingManager) {
      return portalBindingManager.getRemoteEditors()
    } else {
      return []
    }
  }

  async #fetchAnyPortalBinding () {
    const portalBindingManager = await this.teletypePackage.getPortalBindingManager()
    if (!portalBindingManager) return;
    let portalBinding = await portalBindingManager.getActiveGuestPortalBinding()
    if (!portalBinding) {
      let guestPortalBindings = await portalBindingManager.getGuestPortalBindings();
      if (guestPortalBindings) {
          console.log(`found ${guestPortalBindings.length} guest portal bindings, using the first one...`);
          portalBinding = guestPortalBindings[0];
      }
    }
    if (!portalBinding) {
      portalBinding = await portalBindingManager.getHostPortalBinding();
    }
    if (!portalBinding) {
      console.log("no current portalBinding");
      return null;
    }
    return portalBinding;
  }

  async notifyOnDataChannel ({channelName, body}) {
    const portalBinding = await this.#fetchAnyPortalBinding();
    if (!portalBinding) return
    const portalId = portalBinding.portal.portalId;
    portalBinding.portal.router.notify({channelId: `/portals/${portalId}/dataChannel/${channelName}`, body: body})
  }

  async subscribeToDataChannel ({channelName, callback}) {
    const portalBinding = await this.#fetchAnyPortalBinding();
    if (!portalBinding) return
    const portalId = portalBinding.portal.portalId;
    return portalBinding.portal.router.onNotification(`/portals/${portalId}/dataChannel/${channelName}`, callback)
  }

  // only receive msg if we are host
  async subscribeToHostDataChannel ({channelName, callback}) {
    const portalBindingManager = await this.teletypePackage.getPortalBindingManager()
    if (!portalBindingManager) return;
    const portalBinding = await portalBindingManager.getHostPortalBinding();
    if (!portalBinding) return
    const portalId = portalBinding.portal.portalId;
    return portalBinding.portal.router.onNotification(`/portals/${portalId}/dataChannel/${channelName}`, callback)
  }

  // only receive msg if we are guest
  async subscribeToGuestDataChannel ({channelName, callback}) {
    const portalBindingManager = await this.teletypePackage.getPortalBindingManager()
    if (!portalBindingManager) return;
    const portalBinding = await portalBindingManager.getActiveGuestPortalBinding();
    if (!portalBinding) return
    const portalId = portalBinding.portal.portalId;
    return portalBinding.portal.router.onNotification(`/portals/${portalId}/dataChannel/${channelName}`, callback)
  }

  async localUserIdentity() {
    const tmpIdentity = this.teletypePackage.client.getLocalUserIdentity();

    const portalBinding = await this.#fetchAnyPortalBinding();
    if (!portalBinding) return;
    tmpIdentity.siteId = portalBinding.portal.getLocalSiteId();
    return tmpIdentity;
  }

  async peerIdentity(peerId) {
    const portalBinding = await this.#fetchAnyPortalBinding();
    if (!portalBinding) return;
    const login = portalBinding.portal.network.getMemberIdentity(peerId).login;
    const siteId = portalBinding.portal.siteIdsByPeerId.get(peerId);
    return {login: login, siteId: siteId};
  }
}
