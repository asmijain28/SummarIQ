export const DEMO_MODE = true;

export const demoNotes = `## Introduction to Computer Networks

Computer networks are interconnected systems that allow devices to communicate and share resources. Understanding networking fundamentals is essential for modern computing.

### Key Concepts

**Network Types**
- LAN (Local Area Network): Connects devices in a limited area
- WAN (Wide Area Network): Spans large geographical areas
- MAN (Metropolitan Area Network): Covers a city or campus

**Network Protocols**
- **TCP/IP**: Transmission Control Protocol/Internet Protocol
- **HTTP/HTTPS**: HyperText Transfer Protocol (Secure)
- **FTP**: File Transfer Protocol
- **DNS**: Domain Name System

### OSI Model Layers

1. **Physical Layer**: Hardware transmission of raw bits
2. **Data Link Layer**: Node-to-node data transfer
3. **Network Layer**: Routing and forwarding
4. **Transport Layer**: End-to-end connections
5. **Session Layer**: Managing sessions
6. **Presentation Layer**: Data formatting
7. **Application Layer**: User interface

### Important Terms

- **IP Address**: Unique identifier for devices
- **Router**: Directs data between networks
- **Switch**: Connects devices within a network
- **Firewall**: Security system monitoring traffic
- **Bandwidth**: Data transfer capacity

### Network Security

Network security involves protecting data during transmission. Key measures include:
- Encryption of sensitive data
- Authentication mechanisms
- Access control lists
- Intrusion detection systems
- Regular security audits`;

export const demoKeywords = [
  { term: 'TCP/IP', definition: 'Transmission Control Protocol/Internet Protocol - fundamental communication protocol', context: 'TCP/IP is the foundation of internet communication...' },
  { term: 'DNS', definition: 'Domain Name System - translates domain names to IP addresses', context: 'DNS servers resolve human-readable names...' },
  { term: 'Router', definition: 'Network device that forwards data packets between networks', context: 'Routers direct traffic between different networks...' },
  { term: 'Firewall', definition: 'Security system that monitors and controls network traffic', context: 'Firewalls protect networks from unauthorized access...' },
  { term: 'IP Address', definition: 'Unique numerical identifier assigned to each device', context: 'Every device on a network has an IP address...' },
  { term: 'OSI Model', definition: 'Seven-layer framework for network communication', context: 'The OSI model standardizes network functions...' },
];

export const demoFlashcards = [
  { front: 'What does TCP/IP stand for?', back: 'Transmission Control Protocol/Internet Protocol', explanation: 'TCP/IP is the fundamental protocol suite for internet communication.' },
  { front: 'What is the purpose of DNS?', back: 'Translates domain names to IP addresses', explanation: 'DNS makes it easier to access websites using memorable names instead of numbers.' },
  { front: 'How many layers are in the OSI model?', back: 'Seven layers', explanation: 'The OSI model has 7 layers from Physical to Application layer.' },
  { front: 'What is a Router?', back: 'Device that forwards data between networks', explanation: 'Routers direct traffic and connect different networks together.' },
  { front: 'What does LAN stand for?', back: 'Local Area Network', explanation: 'LAN connects devices in a limited geographical area like a home or office.' },
  { front: 'What is a Firewall?', back: 'Security system that monitors network traffic', explanation: 'Firewalls protect networks by blocking unauthorized access and malicious traffic.' },
  { front: 'What does WAN stand for?', back: 'Wide Area Network', explanation: 'WAN connects networks across large geographical distances.' },
  { front: 'What is an IP Address?', back: 'Unique identifier for network devices', explanation: 'Every device on a network needs an IP address to communicate.' },
  { front: 'What is the Physical Layer?', back: 'First layer of OSI model - handles hardware transmission', explanation: 'The Physical layer deals with the actual transmission of raw bits over physical media.' },
  { front: 'What is HTTPS?', back: 'Secure version of HTTP protocol', explanation: 'HTTPS encrypts data between browser and server for secure communication.' },
  { front: 'What is a Switch?', back: 'Device that connects devices within a network', explanation: 'Switches forward data to specific devices based on MAC addresses.' },
  { front: 'What is Bandwidth?', back: 'Data transfer capacity of a network', explanation: 'Bandwidth determines how much data can be transmitted in a given time period.' },
  { front: 'What is the Transport Layer?', back: 'Fourth layer of OSI - handles end-to-end connections', explanation: 'The Transport layer ensures reliable data delivery between applications.' },
  { front: 'What is FTP?', back: 'File Transfer Protocol', explanation: 'FTP is used for transferring files between computers over a network.' },
  { front: 'What is Network Security?', back: 'Protection of data during transmission', explanation: 'Network security involves encryption, authentication, and access control measures.' },
];

export const demoQuiz = [
  {
    question: 'Which protocol is used for secure web browsing?',
    options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'],
    correctAnswer: 1,
    explanation: 'HTTPS (HTTP Secure) encrypts data for secure communication.',
    difficulty: 'Easy'
  },
  {
    question: 'What layer of the OSI model handles routing?',
    options: ['Physical', 'Data Link', 'Network', 'Transport'],
    correctAnswer: 2,
    explanation: 'The Network layer (Layer 3) is responsible for routing and forwarding.',
    difficulty: 'Medium'
  },
  {
    question: 'Which device connects multiple devices within a single network?',
    options: ['Router', 'Switch', 'Modem', 'Hub'],
    correctAnswer: 1,
    explanation: 'A switch connects devices within the same network efficiently.',
    difficulty: 'Easy'
  },
];

export const demoExamQuestions = [
  {
    question: 'What is an IP address?',
    type: 'Short',
    answer: 'An IP address is a unique numerical identifier assigned to each device on a network, used for communication and identification.',
    marks: 5
  },
  {
    question: 'Define the OSI model.',
    type: 'Short',
    answer: 'The OSI (Open Systems Interconnection) model is a seven-layer framework that standardizes network communication functions.',
    marks: 5
  },
  {
    question: 'What does TCP/IP stand for?',
    type: 'Short',
    answer: 'TCP/IP stands for Transmission Control Protocol/Internet Protocol, the fundamental protocol suite for internet communication.',
    marks: 5
  },
  {
    question: 'Explain the difference between TCP and UDP protocols.',
    type: 'Long',
    answer: 'TCP (Transmission Control Protocol) is connection-oriented and ensures reliable data delivery through acknowledgments and retransmission. UDP (User Datagram Protocol) is connectionless and faster but does not guarantee delivery, making it suitable for real-time applications like video streaming.',
    marks: 10
  },
  {
    question: 'Describe how DNS works in detail.',
    type: 'Long',
    answer: 'DNS (Domain Name System) translates human-readable domain names into IP addresses. When you enter a URL, your computer queries a DNS server, which looks up the corresponding IP address in its database and returns it, allowing your browser to connect to the correct server.',
    marks: 10
  },
  {
    question: 'Explain the role of routers in network communication.',
    type: 'Long',
    answer: 'Routers are network devices that forward data packets between different networks. They examine destination IP addresses, determine the best path for data transmission, and direct traffic accordingly. Routers also provide network address translation (NAT) and can implement security policies.',
    marks: 10
  },
  {
    question: 'Why is network security important in modern computing?',
    type: 'Conceptual',
    answer: 'Network security is crucial because it protects sensitive data from unauthorized access, prevents cyber attacks, ensures data integrity during transmission, and maintains user privacy. Without proper security measures, networks are vulnerable to breaches, data theft, and malicious activities.',
    marks: 10
  },
  {
    question: 'Compare and contrast LAN and WAN networks.',
    type: 'Conceptual',
    answer: 'LANs (Local Area Networks) cover small geographical areas like homes or offices with high-speed connections and low latency. WANs (Wide Area Networks) span large distances, connecting multiple LANs with slower speeds and higher latency. LANs are privately owned while WANs often use public infrastructure.',
    marks: 10
  },
  {
    question: 'Describe the purpose of the OSI model in networking.',
    type: 'Conceptual',
    answer: 'The OSI model provides a standardized framework for understanding network communication by dividing it into seven layers, each with specific functions. This layered approach makes it easier to troubleshoot network issues, develop protocols, and ensure interoperability between different systems.',
    marks: 10
  },
  {
    question: 'Why are firewalls essential for network protection?',
    type: 'Conceptual',
    answer: 'Firewalls act as barriers between trusted internal networks and untrusted external networks. They monitor and control incoming and outgoing traffic based on security rules, blocking malicious connections while allowing legitimate communication. This prevents unauthorized access and protects against various cyber threats.',
    marks: 10
  },
];

export const demoChatHistory = [
  {
    id: '1',
    role: 'assistant' as const,
    content: "Hello! I'm your AI study assistant. I can answer questions about computer networks. What would you like to know?"
  }
];
