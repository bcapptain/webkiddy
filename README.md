# WebKiddy 
## A Node.js based network pentesting front- and backend

***[Beta]***

WebKiddy is a web-based interface for various network security and penetration testing tools. It provides an easy-to-use GUI for common network security tasks.

### Features

- Network Information Gathering
  - Local IP detection
  - Public IP detection with ISP information
  - Gateway detection
  - Subnet scanning
- Port Scanning
  - Service detection
  - Version detection
- Web Application Security
  - Nikto web server scanner
  - Basic HTTP/HTTPS probing
- Password Attacks
  - Hydra integration for brute force attacks
  - Custom wordlist support
- Network Scanning
  - ARP scanning support
  - NMAP integration
  - Custom command execution

### Docker Installation (Recommended)

Requirements:
- Docker
- Docker Compose

Installation and Run:

```bash
git clone https://github.com/bcapptain/webkiddy.git
cd webkiddy
docker-compose up --build
```

Access the web interface at: http://localhost:7000

**Note:** The Docker version requires running with elevated privileges due to the network scanning capabilities. Use with caution in trusted environments only.

### Traditional Installation

Requirements:
- Linux (Developed and tested on Debian)
- Node.js
- npm or yarn
  
System Dependencies:
- nmap
- xmlstarlet
- curl
- hydra
- arp-scan
- whois
- nikto (will be installed from source)
- iproute2

Installation Steps:

1. Clone the repository:
```bash
git clone https://github.com/bcapptain/webkiddy.git
cd webkiddy
```

2. Install system dependencies (Debian/Ubuntu):
```bash
sudo apt-get update
sudo apt-get install -y nmap xmlstarlet curl hydra arp-scan whois iproute2
```

3. Install Nikto from source:
```bash
git clone https://github.com/sullo/nikto.git /opt/nikto
sudo ln -s /opt/nikto/program/nikto.pl /usr/local/bin/nikto
sudo chmod +x /usr/local/bin/nikto
```

4. Make scripts executable and copy to system path:
```bash
chmod +x scripts/*
sudo cp scripts/* /usr/bin/
```

5. Install Node.js dependencies:
```bash
npm install
# or
yarn install
```

6. Run the application:
```bash
node backend.js
```

Access the web interface at: http://localhost:7000

### Security Considerations

- This tool is intended for security testing on systems you own or have permission to test
- Running with elevated privileges is required for network scanning features
- Use in isolated/controlled environments only
- Not recommended for production environments
- Keep wordlists secure and appropriate for your testing needs

### Known Issues

- Some features may require root/sudo privileges
- Web interface may occasionally need refresh after long operations
- Error handling could be improved in some areas
- Limited input validation - use with caution

### Contributing

Contributions are welcome! Please feel free to submit pull requests or create issues for bugs and feature requests.

### License

This project is licensed under GPL-2.0. See the LICENSE file for details.

