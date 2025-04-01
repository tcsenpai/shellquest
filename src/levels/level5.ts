import { Level, LevelResult, registerLevel } from '../core/levelSystem';
import { getCurrentGameState } from '../core/gameState';

const level: Level = {
  id: 5,
  name: 'Network Escape',
  description: 'Configure network settings to escape the isolated system.',
  
  async initialize() {
    const gameState = getCurrentGameState();
    if (!gameState) return;
    
    // Initialize level state if not already present
    if (!gameState.levelStates[this.id]) {
      gameState.levelStates[this.id] = {
        interfaces: [
          { name: 'lo', status: 'UP', ip: '127.0.0.1', netmask: '255.0.0.0' },
          { name: 'eth0', status: 'DOWN', ip: '', netmask: '' },
          { name: 'wlan0', status: 'DOWN', ip: '', netmask: '' }
        ],
        firewall: {
          enabled: true,
          rules: [
            { port: 22, protocol: 'tcp', action: 'DENY' },
            { port: 80, protocol: 'tcp', action: 'DENY' },
            { port: 443, protocol: 'tcp', action: 'DENY' },
            { port: 8080, protocol: 'tcp', action: 'DENY' }
          ]
        },
        dns: {
          configured: false,
          server: ''
        },
        gateway: {
          configured: false,
          address: ''
        },
        connections: [],
        escapePortal: {
          host: 'escape.portal',
          ip: '10.0.0.1',
          port: 8080
        }
      };
    }
  },
  
  async render() {
    const gameState = getCurrentGameState();
    if (!gameState) return;
    
    // Make sure level state is initialized
    if (!gameState.levelStates[this.id]) {
      await this.initialize();
    }
    
    const levelState = gameState.levelStates[this.id];
    
    console.log('You\'re trapped in an isolated system. Configure the network to escape.');
    console.log('');
    
    console.log('Network Interfaces:');
    console.log('NAME   STATUS   IP            NETMASK');
    console.log('----------------------------------------');
    
    levelState.interfaces.forEach(iface => {
      console.log(
        `${iface.name.padEnd(7)}${iface.status.padEnd(9)}${iface.ip.padEnd(14)}${iface.netmask}`
      );
    });
    
    console.log('');
    console.log('Firewall Status: ' + (levelState.firewall.enabled ? 'ENABLED' : 'DISABLED'));
    
    if (levelState.firewall.enabled) {
      console.log('Firewall Rules:');
      levelState.firewall.rules.forEach(rule => {
        console.log(`  ${rule.action} ${rule.protocol.toUpperCase()} port ${rule.port}`);
      });
    }
    
    console.log('');
    console.log('DNS Server: ' + (levelState.dns.configured ? levelState.dns.server : 'Not configured'));
    console.log('Default Gateway: ' + (levelState.gateway.configured ? levelState.gateway.address : 'Not configured'));
    
    console.log('');
    console.log('Active Connections:');
    if (levelState.connections.length === 0) {
      console.log('  None');
    } else {
      levelState.connections.forEach(conn => {
        console.log(`  ${conn.protocol.toUpperCase()} ${conn.localAddress}:${conn.localPort} -> ${conn.remoteAddress}:${conn.remotePort}`);
      });
    }
    
    console.log('');
    console.log('Commands: "ifconfig", "ifup [interface]", "ifconfig [interface] [ip] [netmask]",');
    console.log('          "firewall-cmd --list", "firewall-cmd --disable", "firewall-cmd --allow [port]",');
    console.log('          "route add default [gateway]", "echo nameserver [ip] > /etc/resolv.conf",');
    console.log('          "ping [host]", "nslookup [host]", "connect [host] [port]"');
  },
  
  async handleInput(input: string): Promise<LevelResult> {
    const gameState = getCurrentGameState();
    if (!gameState) {
      return { completed: false };
    }
    
    // Make sure level state is initialized
    if (!gameState.levelStates[this.id]) {
      await this.initialize();
    }
    
    const levelState = gameState.levelStates[this.id];
    const command = input.trim();
    
    // Split command into parts
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    
    if (cmd === 'ifconfig') {
      if (parts.length === 1) {
        // Show all interfaces
        return {
          completed: false,
          message: 'Network interfaces displayed.'
        };
      } else if (parts.length >= 4) {
        // Configure an interface
        const ifaceName = parts[1];
        const ip = parts[2];
        const netmask = parts[3];
        
        const iface = levelState.interfaces.find(i => i.name === ifaceName);
        
        if (!iface) {
          return {
            completed: false,
            message: `Interface ${ifaceName} not found.`
          };
        }
        
        if (iface.status === 'DOWN') {
          return {
            completed: false,
            message: `Interface ${ifaceName} is down. Bring it up first with "ifup ${ifaceName}".`
          };
        }
        
        // Simple IP validation
        if (!ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
          return {
            completed: false,
            message: `Invalid IP address format: ${ip}`
          };
        }
        
        // Simple netmask validation
        if (!netmask.match(/^\d+\.\d+\.\d+\.\d+$/)) {
          return {
            completed: false,
            message: `Invalid netmask format: ${netmask}`
          };
        }
        
        // Set IP and netmask
        iface.ip = ip;
        iface.netmask = netmask;
        
        return {
          completed: false,
          message: `Configured ${ifaceName} with IP ${ip} and netmask ${netmask}.`
        };
      }
    }
    
    if (cmd === 'ifup' && parts.length > 1) {
      const ifaceName = parts[1];
      const iface = levelState.interfaces.find(i => i.name === ifaceName);
      
      if (!iface) {
        return {
          completed: false,
          message: `Interface ${ifaceName} not found.`
        };
      }
      
      if (iface.status === 'UP') {
        return {
          completed: false,
          message: `Interface ${ifaceName} is already up.`
        };
      }
      
      // Bring interface up
      iface.status = 'UP';
      
      return {
        completed: false,
        message: `Interface ${ifaceName} is now UP.`
      };
    }
    
    if (cmd === 'firewall-cmd') {
      if (parts.length > 1) {
        const subCmd = parts[1];
        
        if (subCmd === '--list') {
          // List firewall rules
          let message = 'Firewall rules:\n';
          levelState.firewall.rules.forEach(rule => {
            message += `${rule.action} ${rule.protocol.toUpperCase()} port ${rule.port}\n`;
          });
          
          return {
            completed: false,
            message
          };
        } else if (subCmd === '--disable') {
          // Disable firewall
          levelState.firewall.enabled = false;
          
          return {
            completed: false,
            message: 'Firewall disabled.'
          };
        } else if (subCmd === '--allow' && parts.length > 2) {
          // Allow a port
          const port = parseInt(parts[2]);
          
          if (isNaN(port) || port < 1 || port > 65535) {
            return {
              completed: false,
              message: `Invalid port number: ${parts[2]}`
            };
          }
          
          // Find the rule for this port
          const ruleIndex = levelState.firewall.rules.findIndex(r => r.port === port);
          
          if (ruleIndex >= 0) {
            // Update existing rule
            levelState.firewall.rules[ruleIndex].action = 'ALLOW';
          } else {
            // Add new rule
            levelState.firewall.rules.push({
              port,
              protocol: 'tcp',
              action: 'ALLOW'
            });
          }
          
          return {
            completed: false,
            message: `Allowed TCP port ${port} through firewall.`
          };
        }
      }
    }
    
    if (cmd === 'route' && parts[1] === 'add' && parts[2] === 'default' && parts.length > 3) {
      const gateway = parts[3];
      
      // Simple IP validation
      if (!gateway.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return {
          completed: false,
          message: `Invalid gateway address format: ${gateway}`
        };
      }
      
      // Set default gateway
      levelState.gateway.configured = true;
      levelState.gateway.address = gateway;
      
      return {
        completed: false,
        message: `Default gateway set to ${gateway}.`
      };
    }
    
    if (cmd === 'echo' && parts[1] === 'nameserver' && parts.length > 3 && parts[3] === '>' && parts[4] === '/etc/resolv.conf') {
      const dnsServer = parts[2];
      
      // Simple IP validation
      if (!dnsServer.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return {
          completed: false,
          message: `Invalid DNS server address format: ${dnsServer}`
        };
      }
      
      // Set DNS server
      levelState.dns.configured = true;
      levelState.dns.server = dnsServer;
      
      return {
        completed: false,
        message: `DNS server set to ${dnsServer}.`
      };
    }
    
    if (cmd === 'ping' && parts.length > 1) {
      const host = parts[1];
      
      // Check if we have a working network interface
      const hasNetworkInterface = levelState.interfaces.some(iface => 
        iface.status === 'UP' && iface.ip && iface.ip !== '127.0.0.1'
      );
      
      if (!hasNetworkInterface) {
        return {
          completed: false,
          message: 'Network is unreachable. Configure a network interface first.'
        };
      }
      
      // Check if we have a gateway configured
      if (!levelState.gateway.configured) {
        return {
          completed: false,
          message: 'Network is unreachable. Configure a default gateway first.'
        };
      }
      
      // If pinging the escape portal
      if (host === levelState.escapePortal.host) {
        if (!levelState.dns.configured) {
          return {
            completed: false,
            message: `ping: unknown host ${host}. Configure DNS first.`
          };
        }
        
        return {
          completed: false,
          message: `PING ${host} (${levelState.escapePortal.ip}): 56 data bytes\n64 bytes from ${levelState.escapePortal.ip}: icmp_seq=0 ttl=64 time=0.1 ms\n64 bytes from ${levelState.escapePortal.ip}: icmp_seq=1 ttl=64 time=0.1 ms\n\n--- ${host} ping statistics ---\n2 packets transmitted, 2 packets received, 0.0% packet loss\nround-trip min/avg/max/stddev = 0.1/0.1/0.1/0.0 ms`
        };
      } else if (host === levelState.escapePortal.ip) {
        return {
          completed: false,
          message: `PING ${host}: 56 data bytes\n64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.1 ms\n64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.1 ms\n\n--- ${host} ping statistics ---\n2 packets transmitted, 2 packets received, 0.0% packet loss\nround-trip min/avg/max/stddev = 0.1/0.1/0.1/0.0 ms`
        };
      }
      
      return {
        completed: false,
        message: `ping: cannot resolve ${host}: Unknown host`
      };
    }
    
    if (cmd === 'nslookup' && parts.length > 1) {
      const host = parts[1];
      
      if (!levelState.dns.configured) {
        return {
          completed: false,
          message: `nslookup: can't resolve '${host}': No DNS servers configured`
        };
      }
      
      if (host === levelState.escapePortal.host) {
        return {
          completed: false,
          message: `Server:\t${levelState.dns.server}\nAddress:\t${levelState.dns.server}#53\n\nNon-authoritative answer:\nName:\t${host}\nAddress: ${levelState.escapePortal.ip}`
        };
      }
      
      return {
        completed: false,
        message: `Server:\t${levelState.dns.server}\nAddress:\t${levelState.dns.server}#53\n\n** server can't find ${host}: NXDOMAIN`
      };
    }
    
    if (cmd === 'connect' && parts.length > 2) {
      const host = parts[1];
      const port = parseInt(parts[2]);
      
      if (isNaN(port) || port < 1 || port > 65535) {
        return {
          completed: false,
          message: `Invalid port number: ${parts[2]}`
        };
      }
      
      // Check if we have a working network interface
      const hasNetworkInterface = levelState.interfaces.some(iface => 
        iface.status === 'UP' && iface.ip && iface.ip !== '127.0.0.1'
      );
      
      if (!hasNetworkInterface) {
        return {
          completed: false,
          message: 'Network is unreachable. Configure a network interface first.'
        };
      }
      
      // Check if we have a gateway configured
      if (!levelState.gateway.configured) {
        return {
          completed: false,
          message: 'Network is unreachable. Configure a default gateway first.'
        };
      }
      
      // Resolve host if needed
      let resolvedIp = host;
      if (host === levelState.escapePortal.host) {
        if (!levelState.dns.configured) {
          return {
            completed: false,
            message: `connect: could not resolve ${host}: Name or service not known`
          };
        }
        resolvedIp = levelState.escapePortal.ip;
      }
      
      // Check if this is the escape portal
      const isEscapePortal = (resolvedIp === levelState.escapePortal.ip && port === levelState.escapePortal.port);
      
      // Check if firewall allows this connection
      if (levelState.firewall.enabled) {
        const rule = levelState.firewall.rules.find(r => r.port === port);
        if (rule && rule.action === 'DENY') {
          return {
            completed: false,
            message: `connect: Connection refused (blocked by firewall)`
          };
        }
      }
      
      if (isEscapePortal) {
        // Success! Complete the level
        return {
          completed: true,
          message: `Connected to escape portal at ${host}:${port}!\n\nWelcome to the escape portal. You have successfully configured the network and escaped the isolated system.\n\nCongratulations on completing all levels!`,
          nextAction: 'main_menu'
        };
      }
      
      // Add to connections list
      levelState.connections.push({
        protocol: 'tcp',
        localAddress: levelState.interfaces.find(i => i.status === 'UP' && i.ip !== '127.0.0.1')?.ip || '0.0.0.0',
        localPort: 12345 + levelState.connections.length,
        remoteAddress: resolvedIp,
        remotePort: port
      });
      
      return {
        completed: false,
        message: `Connected to ${host}:${port}, but nothing interesting happened.`
      };
    }
    
    return {
      completed: false,
      message: 'Unknown command or invalid syntax.'
    };
  },
  
  hints: [
    'First bring up a network interface with "ifup eth0"',
    'Configure the interface with "ifconfig eth0 10.0.0.2 255.255.255.0"',
    'Set up a default gateway with "route add default 10.0.0.254"',
    'Configure DNS with "echo nameserver 10.0.0.254 > /etc/resolv.conf"',
    'Allow the escape portal port with "firewall-cmd --allow 8080"',
    'Connect to the escape portal with "connect escape.portal 8080"'
  ]
};

export function registerLevel5() {
  registerLevel(level);
} 