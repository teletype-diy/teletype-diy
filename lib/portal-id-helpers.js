const CONTAINS_UUID_REGEXP = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/

function findPortalId (fullString) {
  if (!fullString) return null

  const str_list = fullString.split('/')
  if (str_list.length != 6) return null
  const string = str_list[4];

  const match = string.match(CONTAINS_UUID_REGEXP)
  return match ? match[0] : null
}

// idk, had this integrated into findPortalId, but it broke with undefined
function findPeerId (fullString) {
    if (!fullString) return null

    const str_list = fullString.split('/')
    if (str_list.length != 6) return null
    const remoteHostPeerId = str_list[5];

    const matchRemoteHostPeerId = remoteHostPeerId.match(CONTAINS_UUID_REGEXP)
    return matchRemoteHostPeerId ? remoteHostPeerId : null
}
// function findPeerId (fullString) {
//     if (!fullString) return null
//
//     const str_list = fullString.split('/')
//     if (str_list.length != 6) return null
//     const string = str_list[4];
//     const remoteHostPeerId = str_list[5];
//
//     const match = string.match(CONTAINS_UUID_REGEXP)
//     const matchRemoteHostPeerId = remoteHostPeerId.match(CONTAINS_UUID_REGEXP)
//     return match ? [match[0], remoteHostPeerId] : null
// }

module.exports = {findPortalId, findPeerId}
