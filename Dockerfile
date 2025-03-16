FROM node:16-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nmap \
    xmlstarlet \
    curl \
    hydra \
    arp-scan \
    git \
    perl \
    libnet-ssleay-perl \
    openssl \
    libssl-dev \
    iproute2 \
    whois \
    && rm -rf /var/lib/apt/lists/*

# Install nikto from source
RUN git clone https://github.com/sullo/nikto.git /opt/nikto && \
    ln -s /opt/nikto/program/nikto.pl /usr/local/bin/nikto && \
    chmod +x /usr/local/bin/nikto

# Create app directory
WORKDIR /app

# Create wordlists directory
RUN mkdir -p /app/wordlists

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source
COPY . .

# Make scripts executable and copy to /usr/bin
RUN chmod +x scripts/* && \
    cp scripts/* /usr/bin/

# Expose port
EXPOSE 7000

# Start the application
CMD ["node", "backend.js"] 