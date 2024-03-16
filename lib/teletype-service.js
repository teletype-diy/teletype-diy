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
}
