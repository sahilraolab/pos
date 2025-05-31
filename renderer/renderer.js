const storeAPI = {
  get: async (key) => await window.posAPI.store.get(key),
  set: async (key, value) => await window.posAPI.store.set(key, value),
  has: async (key) => await window.posAPI.store.has(key),
  delete: async (key) => await window.posAPI.store.delete(key),
  clear: async () => await window.posAPI.store.clear(),
  updateItem: async (key, id, updatedFields) => await window.posAPI.store.updateItem(key, id, updatedFields),
};

const printerAPI = {
  // USB printers
  list: async () => await window.posAPI.printers.list(),
  setDefault: async (printer) => await window.posAPI.printers.setDefault(printer),
  getDefault: async () => await window.posAPI.printers.getDefault(),
  print: async (data) => await window.posAPI.printers.print(data),

  // Network printers
  setNetwork: async (ip, port = 9100) => await window.posAPI.printers.setNetwork(ip, port),
  getNetwork: async () => await window.posAPI.printers.getNetwork(),
  printNetwork: async (data) => await window.posAPI.printers.printNetwork(data),

};

const kdsAPI = {
  onConnectionRequest: (callback) => window.posAPI.kds.onConnectionRequest(callback),
  onConnected: (callback) => window.posAPI.kds.onConnected(callback),
  onDisconnected: (callback) => window.posAPI.kds.onKDSDisconnected(callback),
  approveConnection: async (id, approved) => await window.posAPI.kds.approveConnection(id, approved),
  disconnect: async () => await window.posAPI.kds.disconnect()
};

// Format the KDS name (you can customize this if needed)
function formatKdsName(kdsId) {
  return kdsId?.split(':')[0]; // Extract IP only if needed
}

// Show connected KDS status
window.posAPI.kds.onKDSConnected((data) => {
  const ip = formatKdsName(data.kdsId);
  document.getElementById('kds-status').textContent = `✅ Connected to ${ip}`;
});

// Show disconnected status
window.posAPI.kds.onKDSDisconnected(() => {
  document.getElementById('kds-status').textContent = '❌ No KDS connected';
});

// Handle incoming data from KDS
window.posAPI.kds.onKDSData(({ kdsId, data }) => {
  const ip = formatKdsName(kdsId);
  const log = document.createElement('div');
  log.textContent = `📨 Message from ${ip}: ${JSON.stringify(data)}`;
  document.getElementById('log').appendChild(log);
});

// Optional: Disconnect all KDS on button click
document.getElementById('disconnect-btn').addEventListener('click', () => {
  window.posAPI.kds.disconnectAllKDS();
});

// Optional: Send test data to all connected KDS clients
document.getElementById('broadcast-btn').addEventListener('click', () => {
  const testData = {
    message: 'Hello from POS!',
    timestamp: new Date().toISOString()
  };
  window.posAPI.kds.broadcastData(testData);
});
