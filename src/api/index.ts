const API_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  async getSystem() {
    const res = await fetch(`${API_URL}/api/system`);
    return res.json();
  },

  async getServers() {
    const res = await fetch(`${API_URL}/api/servers`);
    return res.json();
  },

  async getServer(id: string) {
    const res = await fetch(`${API_URL}/api/servers/${id}`);
    return res.json();
  },

  async createServer(data: any) {
    const res = await fetch(`${API_URL}/api/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateServer(id: string, data: any) {
    const res = await fetch(`${API_URL}/api/servers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteServer(id: string) {
    const res = await fetch(`${API_URL}/api/servers/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async installServer(id: string) {
    const res = await fetch(`${API_URL}/api/servers/${id}/install`, {
      method: 'POST'
    });
    return res.json();
  },

  async startServer(id: string) {
    const res = await fetch(`${API_URL}/api/servers/${id}/start`, {
      method: 'POST'
    });
    return res.json();
  },

  async stopServer(id: string) {
    const res = await fetch(`${API_URL}/api/servers/${id}/stop`, {
      method: 'POST'
    });
    return res.json();
  },

  async restartServer(id: string) {
    const res = await fetch(`${API_URL}/api/servers/${id}/restart`, {
      method: 'POST'
    });
    return res.json();
  },

  async sendCommand(id: string, command: string) {
    const res = await fetch(`${API_URL}/api/servers/${id}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    return res.json();
  },

  async getLogs(id: string) {
    const res = await fetch(`${API_URL}/api/servers/${id}/logs`);
    return res.json();
  },

  async getFiles(id: string, path: string = '') {
    const res = await fetch(`${API_URL}/api/servers/${id}/files?path=${encodeURIComponent(path)}`);
    return res.json();
  },

  async createFile(id: string, path: string, content: string = '', isDirectory: boolean = false) {
    const res = await fetch(`${API_URL}/api/servers/${id}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content, isDirectory })
    });
    return res.json();
  },

  async updateFile(id: string, path: string, content: string) {
    const res = await fetch(`${API_URL}/api/servers/${id}/files`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content })
    });
    return res.json();
  },

  async deleteFile(id: string, path: string) {
    const res = await fetch(`${API_URL}/api/servers/${id}/files?path=${encodeURIComponent(path)}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async uploadFile(id: string, path: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    
    const res = await fetch(`${API_URL}/api/servers/${id}/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  getDownloadUrl(id: string, path: string) {
    return `${API_URL}/api/servers/${id}/download?path=${encodeURIComponent(path)}`;
  },

  getWebSocketUrl(serverId: string) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = API_URL ? new URL(API_URL).host : window.location.host;
    return `${wsProtocol}//${host}/ws?server=${serverId}`;
  }
};
