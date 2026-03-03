const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const http = require('http');
const os = require('os');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

const BASE_DIR = process.env.GMOD_DIR || path.join(os.homedir(), 'gmod-servers');
const STEAMCMD_DIR = path.join(BASE_DIR, 'steamcmd');
const SERVERS_DIR = path.join(BASE_DIR, 'servers');

fs.ensureDirSync(BASE_DIR);
fs.ensureDirSync(STEAMCMD_DIR);
fs.ensureDirSync(SERVERS_DIR);

const serverProcesses = new Map();
const serverLogs = new Map();
const wsClients = new Map();

const broadcast = (serverId, type, data) => {
  wsClients.forEach((clientServerId, ws) => {
    if (clientServerId === serverId && ws.readyState === 1) {
      ws.send(JSON.stringify({ type, data }));
    }
  });
};

const getServerConfig = (serverId) => {
  const configPath = path.join(SERVERS_DIR, serverId, 'server.json');
  if (fs.existsSync(configPath)) {
    return fs.readJsonSync(configPath);
  }
  return null;
};

const saveServerConfig = (serverId, config) => {
  const configPath = path.join(SERVERS_DIR, serverId, 'server.json');
  fs.writeJsonSync(configPath, config, { spaces: 2 });
};

const getSystemStats = () => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  let cpuUsage = 0;
  cpus.forEach(cpu => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    cpuUsage += ((total - idle) / total) * 100;
  });
  cpuUsage = cpuUsage / cpus.length;

  return {
    cpu: Math.round(cpuUsage),
    ram: {
      used: Math.round(usedMem / 1024 / 1024),
      total: Math.round(totalMem / 1024 / 1024),
      percent: Math.round((usedMem / totalMem) * 100)
    },
    uptime: os.uptime()
  };
};

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const serverId = url.searchParams.get('server');
  
  if (serverId) {
    wsClients.set(ws, serverId);
    
    const logs = serverLogs.get(serverId) || [];
    logs.forEach(log => {
      ws.send(JSON.stringify({ type: 'console', data: log }));
    });
  }

  ws.on('message', (message) => {
    try {
      const { type, serverId, command } = JSON.parse(message);
      
      if (type === 'command' && serverId && command) {
        const proc = serverProcesses.get(serverId);
        if (proc && proc.stdin) {
          proc.stdin.write(command + '\n');
          broadcast(serverId, 'console', `> ${command}`);
        }
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    wsClients.delete(ws);
  });
});

app.get('/api/system', (req, res) => {
  res.json(getSystemStats());
});

app.get('/api/servers', (req, res) => {
  try {
    const servers = [];
    if (fs.existsSync(SERVERS_DIR)) {
      const dirs = fs.readdirSync(SERVERS_DIR);
      dirs.forEach(dir => {
        const config = getServerConfig(dir);
        if (config) {
          servers.push({
            ...config,
            id: dir,
            running: serverProcesses.has(dir),
            installed: fs.existsSync(path.join(SERVERS_DIR, dir, 'garrysmod'))
          });
        }
      });
    }
    res.json(servers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/servers', (req, res) => {
  try {
    const { name, port, maxPlayers, gamemode, map, tickrate } = req.body;
    const id = `server_${Date.now()}`;
    const serverDir = path.join(SERVERS_DIR, id);
    
    fs.ensureDirSync(serverDir);
    
    const config = {
      id,
      name: name || 'New Server',
      port: port || 27015,
      maxPlayers: maxPlayers || 32,
      gamemode: gamemode || 'sandbox',
      map: map || 'gm_flatgrass',
      tickrate: tickrate || 66,
      rconPassword: '',
      svPassword: '',
      hostname: name || 'Garry\'s Mod Server',
      createdAt: new Date().toISOString()
    };
    
    saveServerConfig(id, config);
    res.json({ success: true, server: config });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/servers/:id', (req, res) => {
  const config = getServerConfig(req.params.id);
  if (config) {
    res.json({
      ...config,
      running: serverProcesses.has(req.params.id),
      installed: fs.existsSync(path.join(SERVERS_DIR, req.params.id, 'garrysmod'))
    });
  } else {
    res.status(404).json({ error: 'Server not found' });
  }
});

app.put('/api/servers/:id', (req, res) => {
  try {
    const config = getServerConfig(req.params.id);
    if (!config) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    const updated = { ...config, ...req.body };
    saveServerConfig(req.params.id, updated);
    
    const serverCfgPath = path.join(SERVERS_DIR, req.params.id, 'garrysmod', 'cfg', 'server.cfg');
    if (fs.existsSync(path.dirname(serverCfgPath))) {
      const serverCfg = `hostname "${updated.hostname || updated.name}"
sv_password "${updated.svPassword || ''}"
rcon_password "${updated.rconPassword || ''}"
sv_maxrate 0
sv_minrate 100000
sv_maxupdaterate ${updated.tickrate || 66}
sv_minupdaterate ${updated.tickrate || 66}
sv_maxcmdrate ${updated.tickrate || 66}
sv_mincmdrate ${updated.tickrate || 66}
net_maxfilesize 64
sv_downloadurl "${updated.fastdl || ''}"
sv_allowdownload 1
sv_allowupload 0
`;
      fs.writeFileSync(serverCfgPath, serverCfg);
    }
    
    res.json({ success: true, server: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/servers/:id', (req, res) => {
  try {
    const serverDir = path.join(SERVERS_DIR, req.params.id);
    if (serverProcesses.has(req.params.id)) {
      serverProcesses.get(req.params.id).kill('SIGTERM');
      serverProcesses.delete(req.params.id);
    }
    fs.removeSync(serverDir);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/servers/:id/install', (req, res) => {
  const serverId = req.params.id;
  const serverDir = path.join(SERVERS_DIR, serverId);
  
  serverLogs.set(serverId, []);
  
  const addLog = (msg) => {
    const logs = serverLogs.get(serverId) || [];
    logs.push(msg);
    if (logs.length > 1000) logs.shift();
    serverLogs.set(serverId, logs);
    broadcast(serverId, 'install', msg);
  };

  const isWindows = process.platform === 'win32';
  const steamcmdExe = isWindows ? 'steamcmd.exe' : './steamcmd.sh';
  const steamcmdPath = path.join(STEAMCMD_DIR, steamcmdExe);

  const installSteamCMD = () => {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(steamcmdPath)) {
        addLog('[SteamCMD] Already installed');
        return resolve();
      }

      addLog('[SteamCMD] Downloading...');
      
      const downloadUrl = isWindows 
        ? 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip'
        : 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz';

      const downloadCmd = isWindows
        ? `powershell -Command "Invoke-WebRequest -Uri '${downloadUrl}' -OutFile '${path.join(STEAMCMD_DIR, 'steamcmd.zip')}'; Expand-Archive -Path '${path.join(STEAMCMD_DIR, 'steamcmd.zip')}' -DestinationPath '${STEAMCMD_DIR}' -Force"`
        : `cd ${STEAMCMD_DIR} && curl -sqL "${downloadUrl}" | tar zxvf -`;

      exec(downloadCmd, (error, stdout, stderr) => {
        if (error) {
          addLog(`[SteamCMD] Download error: ${error.message}`);
          return reject(error);
        }
        addLog('[SteamCMD] Downloaded successfully');
        
        if (!isWindows) {
          fs.chmodSync(steamcmdPath, '755');
        }
        resolve();
      });
    });
  };

  const installGmod = () => {
    return new Promise((resolve, reject) => {
      addLog('[GMOD] Starting installation...');
      addLog('[GMOD] This may take 10-30 minutes depending on your connection');
      
      const args = [
        '+force_install_dir', serverDir,
        '+login', 'anonymous',
        '+app_update', '4020', 'validate',
        '+quit'
      ];

      const proc = spawn(steamcmdPath, args, { 
        cwd: STEAMCMD_DIR,
        shell: true 
      });

      proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            addLog(`[GMOD] ${line.trim()}`);
          }
        });
      });

      proc.stderr.on('data', (data) => {
        addLog(`[GMOD] ${data.toString()}`);
      });

      proc.on('close', (code) => {
        if (code === 0) {
          addLog('[GMOD] Installation completed successfully!');
          
          const cfgDir = path.join(serverDir, 'garrysmod', 'cfg');
          fs.ensureDirSync(cfgDir);
          
          const config = getServerConfig(serverId);
          const serverCfg = `hostname "${config?.hostname || config?.name || 'Garry\'s Mod Server'}"
sv_password "${config?.svPassword || ''}"
rcon_password "${config?.rconPassword || ''}"
sv_maxrate 0
sv_minrate 100000
`;
          fs.writeFileSync(path.join(cfgDir, 'server.cfg'), serverCfg);
          
          resolve();
        } else {
          addLog(`[GMOD] Installation failed with code ${code}`);
          reject(new Error(`Exit code: ${code}`));
        }
      });
    });
  };

  installSteamCMD()
    .then(() => installGmod())
    .then(() => {
      res.json({ success: true, message: 'Installation completed' });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.post('/api/servers/:id/start', (req, res) => {
  try {
    const serverId = req.params.id;
    const serverDir = path.join(SERVERS_DIR, serverId);
    const config = getServerConfig(serverId);
    
    if (!config) {
      return res.status(404).json({ error: 'Server not found' });
    }

    if (serverProcesses.has(serverId)) {
      return res.status(400).json({ error: 'Server already running' });
    }

    const isWindows = process.platform === 'win32';
    const srcdsExe = isWindows ? 'srcds.exe' : './srcds_run';
    const srcdsPath = path.join(serverDir, srcdsExe);

    if (!fs.existsSync(srcdsPath)) {
      return res.status(400).json({ error: 'Server not installed. Please install first.' });
    }

    serverLogs.set(serverId, []);

    const args = [
      '-game', 'garrysmod',
      '-port', config.port.toString(),
      '-maxplayers', config.maxPlayers.toString(),
      '+gamemode', config.gamemode,
      '+map', config.map,
      '-tickrate', config.tickrate.toString(),
      '-norestart',
      '+sv_setsteamaccount', config.gslt || ''
    ];

    if (config.workshopCollection) {
      args.push('+host_workshop_collection', config.workshopCollection);
    }

    const proc = spawn(srcdsPath, args, {
      cwd: serverDir,
      shell: true
    });

    serverProcesses.set(serverId, proc);

    const addLog = (msg) => {
      const logs = serverLogs.get(serverId) || [];
      logs.push(msg);
      if (logs.length > 500) logs.shift();
      serverLogs.set(serverId, logs);
      broadcast(serverId, 'console', msg);
    };

    proc.stdout.on('data', (data) => {
      data.toString().split('\n').forEach(line => {
        if (line.trim()) addLog(line.trim());
      });
    });

    proc.stderr.on('data', (data) => {
      data.toString().split('\n').forEach(line => {
        if (line.trim()) addLog(`[ERROR] ${line.trim()}`);
      });
    });

    proc.on('close', (code) => {
      addLog(`[SERVER] Process exited with code ${code}`);
      serverProcesses.delete(serverId);
      broadcast(serverId, 'status', { running: false });
    });

    res.json({ success: true, message: 'Server started' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/servers/:id/stop', (req, res) => {
  try {
    const serverId = req.params.id;
    const proc = serverProcesses.get(serverId);
    
    if (!proc) {
      return res.status(400).json({ error: 'Server not running' });
    }

    proc.stdin.write('quit\n');
    
    setTimeout(() => {
      if (serverProcesses.has(serverId)) {
        proc.kill('SIGTERM');
        serverProcesses.delete(serverId);
      }
    }, 5000);

    res.json({ success: true, message: 'Server stopping' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/servers/:id/restart', async (req, res) => {
  try {
    const serverId = req.params.id;
    const proc = serverProcesses.get(serverId);
    
    if (proc) {
      proc.stdin.write('quit\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
      if (serverProcesses.has(serverId)) {
        proc.kill('SIGTERM');
        serverProcesses.delete(serverId);
      }
    }

    setTimeout(() => {
      const fakeReq = { params: { id: serverId } };
      const fakeRes = {
        json: () => {},
        status: () => ({ json: () => {} })
      };
    }, 2000);

    res.json({ success: true, message: 'Server restarting' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/servers/:id/command', (req, res) => {
  try {
    const { command } = req.body;
    const proc = serverProcesses.get(req.params.id);
    
    if (!proc) {
      return res.status(400).json({ error: 'Server not running' });
    }

    proc.stdin.write(command + '\n');
    broadcast(req.params.id, 'console', `> ${command}`);
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/servers/:id/logs', (req, res) => {
  const logs = serverLogs.get(req.params.id) || [];
  res.json(logs);
});

app.get('/api/servers/:id/files', (req, res) => {
  try {
    const serverId = req.params.id;
    const relativePath = req.query.path || '';
    const serverDir = path.join(SERVERS_DIR, serverId);
    const targetPath = path.join(serverDir, relativePath);

    if (!targetPath.startsWith(serverDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: 'Path not found' });
    }

    const stats = fs.statSync(targetPath);
    
    if (stats.isDirectory()) {
      const items = fs.readdirSync(targetPath).map(name => {
        const itemPath = path.join(targetPath, name);
        const itemStats = fs.statSync(itemPath);
        return {
          name,
          type: itemStats.isDirectory() ? 'directory' : 'file',
          size: itemStats.size,
          modified: itemStats.mtime
        };
      });
      
      items.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      
      res.json({ type: 'directory', items, path: relativePath });
    } else {
      const content = fs.readFileSync(targetPath, 'utf-8');
      res.json({ type: 'file', content, path: relativePath });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/servers/:id/files', (req, res) => {
  try {
    const serverId = req.params.id;
    const { path: filePath, content, isDirectory } = req.body;
    const serverDir = path.join(SERVERS_DIR, serverId);
    const targetPath = path.join(serverDir, filePath);

    if (!targetPath.startsWith(serverDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (isDirectory) {
      fs.ensureDirSync(targetPath);
    } else {
      fs.ensureDirSync(path.dirname(targetPath));
      fs.writeFileSync(targetPath, content || '');
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/servers/:id/files', (req, res) => {
  try {
    const serverId = req.params.id;
    const { path: filePath, content } = req.body;
    const serverDir = path.join(SERVERS_DIR, serverId);
    const targetPath = path.join(serverDir, filePath);

    if (!targetPath.startsWith(serverDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    fs.writeFileSync(targetPath, content);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/servers/:id/files', (req, res) => {
  try {
    const serverId = req.params.id;
    const filePath = req.query.path;
    const serverDir = path.join(SERVERS_DIR, serverId);
    const targetPath = path.join(serverDir, filePath);

    if (!targetPath.startsWith(serverDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    fs.removeSync(targetPath);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const upload = multer({ dest: path.join(BASE_DIR, 'uploads') });

app.post('/api/servers/:id/upload', upload.single('file'), (req, res) => {
  try {
    const serverId = req.params.id;
    const targetDir = req.body.path || '';
    const serverDir = path.join(SERVERS_DIR, serverId);
    const destPath = path.join(serverDir, targetDir, req.file.originalname);

    if (!destPath.startsWith(serverDir)) {
      fs.removeSync(req.file.path);
      return res.status(403).json({ error: 'Access denied' });
    }

    fs.ensureDirSync(path.dirname(destPath));
    fs.moveSync(req.file.path, destPath, { overwrite: true });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/servers/:id/download', (req, res) => {
  try {
    const serverId = req.params.id;
    const filePath = req.query.path;
    const serverDir = path.join(SERVERS_DIR, serverId);
    const targetPath = path.join(serverDir, filePath);

    if (!targetPath.startsWith(serverDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.download(targetPath);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Base directory: ${BASE_DIR}`);
});
