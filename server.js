const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const natural = require('natural');
const stringSimilarity = require('string-similarity');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (with fallback for demo mode)
let db = null;
try {
  let serviceAccount;
  
  // Check if Firebase service account is provided via environment variable (Railway)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('📋 Using Firebase credentials from environment variables');
  } else {
    // Fallback to local file
    serviceAccount = require('./firebase-service-account.json');
    console.log('📋 Using Firebase credentials from local file');
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: 'scammerdetection'
  });
  db = admin.firestore();
  console.log('✅ Firebase connected successfully');
} catch (error) {
  // In-memory storage for demo mode (persists during session)
  global.demoData = global.demoData || {
    submissions: [],
    nodes: [],
    edges: []
  };
  
  const demoData = global.demoData;
  
  console.log('⚠️  Firebase not configured - running in demo mode');
  console.log('   Data will be stored in memory only');
  console.log('   To use real Firebase, update firebase-service-account.json with real credentials');
  
  // Add some sample data for demo
  if (demoData.submissions.length === 0) {
    console.log('📊 Adding sample data for demo...');
    const sampleSubmission = {
      id: 'demo-1',
      text: 'URGENT: Your PayPal account has been suspended. Click here to verify: https://paypal-secure-login.com',
      type: 'email',
      riskScore: 95,
      riskCategory: 'high',
      features: { hasUrgency: true, hasSuspiciousUrl: true, hasFinancialService: true },
      timestamp: new Date(),
      similarSubmissions: []
    };
    demoData.submissions.push(sampleSubmission);
    demoData.nodes.push({
      id: 'demo-1',
      label: 'URGENT: Your PayPal account has been suspended...',
      riskScore: 95,
      riskCategory: 'high',
      type: 'email',
      timestamp: new Date()
    });
  }
  
  db = {
    collection: (name) => ({
      doc: (id) => ({
        set: async (data) => {
          const index = demoData[name].findIndex(item => item.id === id);
          if (index >= 0) {
            demoData[name][index] = data;
          } else {
            demoData[name].push(data);
          }
          return Promise.resolve();
        },
        get: async () => Promise.resolve({
          docs: demoData[name].map(item => ({ data: () => item }))
        })
      }),
      get: async () => Promise.resolve({
        docs: demoData[name].map(item => ({ data: () => item }))
      }),
      orderBy: (field) => ({
        limit: (count) => ({
          get: async () => Promise.resolve({
            docs: demoData[name]
              .sort((a, b) => {
                if (field === 'timestamp') {
                  return new Date(b.timestamp) - new Date(a.timestamp);
                }
                return 0;
              })
              .slice(0, count || 50)
              .map(item => ({ data: () => item }))
          })
        })
      })
    })
  };
}

// Preloaded datasets for ML classification
const PHISHING_URLS = [
  'paypal-secure-login.com', 'amazon-verify-account.net', 'bankofamerica-secure.com',
  'wellsfargo-verify.net', 'chase-banking-secure.com', 'citibank-verify.net',
  'ebay-secure-login.net', 'apple-id-verify.com', 'microsoft-account-secure.net',
  'netflix-billing-verify.com', 'spotify-premium-verify.net', 'instagram-verify.net',
  'facebook-security-check.net', 'twitter-verify-account.com', 'linkedin-secure.net',
  'gmail-security-alert.com', 'yahoo-verify-account.net', 'outlook-secure.net',
  'dropbox-verify-account.com', 'google-drive-secure.net', 'onedrive-verify.net',
  'uber-verify-account.com', 'lyft-security-check.net', 'airbnb-verify.net',
  'booking-verify-account.com', 'expedia-security.net', 'hotels-verify.net',
  'walmart-verify-account.com', 'target-security-check.net', 'bestbuy-verify.net',
  'costco-verify-account.com', 'samsclub-security.net', 'kroger-verify.net',
  'cvs-verify-account.com', 'walgreens-security.net', 'riteaid-verify.net',
  'starbucks-verify-account.com', 'mcdonalds-security.net', 'subway-verify.net',
  'dominos-verify-account.com', 'pizzahut-security.net', 'kfc-verify.net',
  'tacobell-verify-account.com', 'burgerking-security.net', 'wendys-verify.net',
  'chickfila-verify-account.com', 'popeyes-security.net', 'chipotle-verify.net',
  'panera-verify-account.com', 'olivegarden-security.net', 'redlobster-verify.net',
  'outback-verify-account.com', 'texasroadhouse-security.net', 'longhorn-verify.net',
  'buffalowildwings-verify-account.com', 'hooters-security.net', 'tgi-fridays-verify.net',
  'applebees-verify-account.com', 'chilis-security.net', 'redrobin-verify.net',
  'fiveguys-verify-account.com', 'shake-shack-security.net', 'in-n-out-verify.net',
  'whataburger-verify-account.com', 'culvers-security.net', 'steak-n-shake-verify.net',
  'sonic-verify-account.com', 'dairy-queen-security.net', 'baskin-robbins-verify.net',
  'cold-stone-verify-account.com', 'ben-jerrys-security.net', 'haagen-dazs-verify.net',
  'baskin-robbins-verify-account.com', 'dunkin-security.net', 'krispy-kreme-verify.net',
  'tim-hortons-verify-account.com', 'starbucks-security.net', 'peets-coffee-verify.net',
  'caribou-coffee-verify-account.com', 'the-coffee-bean-security.net', 'philz-coffee-verify.net',
  'blue-bottle-verify-account.com', 'intelligentsia-security.net', 'stumptown-verify.net',
  'counter-culture-verify-account.com', 'ritual-coffee-security.net', 'verve-verify.net',
  'bird-rock-verify-account.com', 'sightglass-security.net', 'four-barrel-verify.net',
  'ritual-coffee-verify-account.com', 'blue-bottle-security.net', 'stumptown-verify.net',
  'intelligentsia-verify-account.com', 'philz-coffee-security.net', 'the-coffee-bean-verify.net',
  'caribou-coffee-verify-account.com', 'peets-coffee-security.net', 'starbucks-verify.net',
  'tim-hortons-verify-account.com', 'krispy-kreme-security.net', 'dunkin-verify.net',
  'baskin-robbins-verify-account.com', 'haagen-dazs-security.net', 'ben-jerrys-verify.net',
  'cold-stone-verify-account.com', 'baskin-robbins-security.net', 'dairy-queen-verify.net',
  'sonic-verify-account.com', 'steak-n-shake-security.net', 'culvers-verify.net',
  'whataburger-verify-account.com', 'in-n-out-security.net', 'shake-shack-verify.net',
  'fiveguys-verify-account.com', 'redrobin-security.net', 'chilis-verify.net',
  'applebees-verify-account.com', 'tgi-fridays-security.net', 'hooters-verify.net',
  'buffalowildwings-verify-account.com', 'longhorn-security.net', 'texasroadhouse-verify.net',
  'outback-verify-account.com', 'redlobster-security.net', 'olivegarden-verify.net',
  'panera-verify-account.com', 'chipotle-security.net', 'popeyes-verify.net',
  'chickfila-verify-account.com', 'wendys-security.net', 'burgerking-verify.net',
  'tacobell-verify-account.com', 'kfc-security.net', 'pizzahut-verify.net',
  'dominos-verify-account.com', 'subway-security.net', 'mcdonalds-verify.net',
  'starbucks-verify-account.com', 'riteaid-security.net', 'walgreens-verify.net',
  'cvs-verify-account.com', 'kroger-security.net', 'samsclub-verify.net',
  'costco-verify-account.com', 'bestbuy-security.net', 'target-verify.net',
  'walmart-verify-account.com', 'hotels-security.net', 'expedia-verify.net',
  'booking-verify-account.com', 'airbnb-security.net', 'lyft-verify.net',
  'uber-verify-account.com', 'onedrive-security.net', 'google-drive-verify.net',
  'dropbox-verify-account.com', 'outlook-security.net', 'yahoo-verify.net',
  'gmail-verify-account.com', 'linkedin-security.net', 'twitter-verify.net',
  'facebook-verify-account.com', 'instagram-security.net', 'spotify-premium-verify.net',
  'netflix-billing-verify.com', 'microsoft-account-secure.net', 'apple-id-verify.com',
  'ebay-secure-login.net', 'citibank-verify.net', 'chase-banking-secure.com',
  'wellsfargo-verify.net', 'bankofamerica-secure.com', 'amazon-verify-account.net'
];

const SPAM_KEYWORDS = [
  'urgent', 'account suspended', 'verify now', 'click here', 'limited time',
  'free gift', 'claim now', 'congratulations', 'you won', 'lottery',
  'inheritance', 'bank transfer', 'urgent action', 'security alert',
  'password expired', 'login required', 'unusual activity', 'suspicious login',
  'verify identity', 'confirm details', 'update information', 'reactivate account',
  'billing issue', 'payment required', 'overdue payment', 'refund available',
  'tax refund', 'government grant', 'stimulus check', 'covid relief',
  'medical alert', 'prescription ready', 'insurance claim', 'legal notice',
  'court summons', 'arrest warrant', 'police investigation', 'fbi alert',
  'irs notice', 'social security', 'medicare update', 'medicaid alert',
  'credit score', 'loan approval', 'mortgage rate', 'debt relief',
  'investment opportunity', 'crypto alert', 'bitcoin offer', 'stock tip',
  'real estate', 'timeshare', 'vacation package', 'cruise deal',
  'airline ticket', 'hotel booking', 'car rental', 'insurance quote',
  'home warranty', 'security system', 'alarm monitoring', 'utility bill',
  'cable service', 'internet provider', 'phone plan', 'mobile upgrade',
  'software update', 'virus scan', 'malware removal', 'system optimization',
  'data backup', 'cloud storage', 'email security', 'password manager',
  'vpn service', 'antivirus', 'firewall', 'encryption',
  'two-factor', 'biometric', 'facial recognition', 'fingerprint scan',
  'voice verification', 'sms code', 'email verification', 'phone verification',
  'address verification', 'id verification', 'document upload', 'selfie required',
  'government id', 'passport scan', 'driver license', 'social security card',
  'birth certificate', 'marriage license', 'divorce decree', 'death certificate',
  'will document', 'power of attorney', 'trust document', 'estate planning',
  'tax document', 'financial statement', 'bank statement', 'credit report',
  'insurance policy', 'medical record', 'prescription', 'lab result',
  'x-ray image', 'mri scan', 'ct scan', 'ultrasound',
  'blood test', 'urine test', 'stool test', 'biopsy result',
  'pathology report', 'surgery record', 'discharge summary', 'medical bill',
  'insurance claim', 'co-pay', 'deductible', 'out-of-pocket',
  'premium payment', 'policy renewal', 'coverage change', 'benefit update',
  'claim status', 'appeal process', 'grievance', 'complaint',
  'customer service', 'technical support', 'billing support', 'sales inquiry',
  'product information', 'pricing quote', 'demo request', 'trial offer',
  'subscription', 'membership', 'loyalty program', 'rewards points',
  'cashback offer', 'discount code', 'coupon', 'promotion',
  'sale event', 'clearance', 'limited edition', 'exclusive offer',
  'vip access', 'early bird', 'pre-order', 'backorder',
  'out of stock', 'discontinued', 'recall notice', 'safety alert',
  'product defect', 'quality issue', 'warranty claim', 'return request',
  'refund process', 'exchange', 'replacement', 'repair service',
  'maintenance', 'upgrade', 'installation', 'setup assistance',
  'training', 'documentation', 'user manual', 'help guide',
  'faq', 'troubleshooting', 'error message', 'system status',
  'scheduled maintenance', 'planned outage', 'emergency alert', 'weather warning',
  'traffic update', 'road closure', 'construction', 'detour',
  'accident report', 'police activity', 'fire alert', 'medical emergency',
  'ambulance', 'fire truck', 'police car', 'emergency vehicle',
  'evacuation order', 'shelter in place', 'lockdown', 'curfew',
  'travel advisory', 'border closure', 'quarantine', 'isolation',
  'contact tracing', 'exposure notification', 'testing site', 'vaccination',
  'booster shot', 'side effects', 'allergic reaction', 'medical history',
  'medication list', 'allergy list', 'family history', 'genetic testing',
  'cancer screening', 'heart disease', 'diabetes', 'hypertension',
  'cholesterol', 'blood pressure', 'weight loss', 'exercise program',
  'diet plan', 'nutrition', 'supplements', 'vitamins',
  'herbs', 'natural remedies', 'alternative medicine', 'holistic health',
  'mental health', 'depression', 'anxiety', 'stress management',
  'therapy', 'counseling', 'support group', 'crisis hotline',
  'suicide prevention', 'domestic violence', 'child abuse', 'elder abuse',
  'animal cruelty', 'environmental protection', 'climate change', 'recycling',
  'conservation', 'wildlife protection', 'ocean cleanup', 'forest preservation',
  'air quality', 'water quality', 'soil contamination', 'pollution control',
  'energy efficiency', 'renewable energy', 'solar power', 'wind power',
  'hydroelectric', 'geothermal', 'nuclear power', 'fossil fuels',
  'carbon footprint', 'greenhouse gases', 'ozone layer', 'biodiversity',
  'endangered species', 'habitat loss', 'deforestation', 'desertification',
  'soil erosion', 'water scarcity', 'food security', 'agriculture',
  'farming', 'livestock', 'fisheries', 'aquaculture',
  'genetic engineering', 'biotechnology', 'nanotechnology', 'artificial intelligence',
  'machine learning', 'deep learning', 'neural networks', 'robotics',
  'automation', 'cybersecurity', 'data privacy', 'blockchain',
  'cryptocurrency', 'digital currency', 'central bank', 'monetary policy',
  'inflation', 'recession', 'economic growth', 'unemployment',
  'job market', 'career development', 'skill training', 'education',
  'online learning', 'distance education', 'virtual classroom', 'e-learning',
  'mobile app', 'web application', 'software development', 'programming',
  'coding', 'debugging', 'testing', 'quality assurance',
  'project management', 'agile methodology', 'scrum', 'kanban',
  'lean management', 'six sigma', 'total quality', 'continuous improvement',
  'change management', 'organizational development', 'leadership', 'team building',
  'communication', 'collaboration', 'conflict resolution', 'negotiation',
  'decision making', 'problem solving', 'critical thinking', 'creativity',
  'innovation', 'entrepreneurship', 'startup', 'business plan',
  'market research', 'competitive analysis', 'customer segmentation', 'target market',
  'product development', 'brand strategy', 'marketing campaign', 'advertising',
  'public relations', 'social media', 'content marketing', 'email marketing',
  'search engine optimization', 'pay-per-click', 'affiliate marketing', 'influencer marketing',
  'viral marketing', 'guerrilla marketing', 'ambush marketing', 'stealth marketing',
  'relationship marketing', 'loyalty marketing', 'retention marketing', 'acquisition marketing',
  'conversion optimization', 'user experience', 'customer journey', 'touchpoint',
  'omnichannel', 'multichannel', 'cross-channel', 'integrated marketing',
  'data-driven marketing', 'predictive analytics', 'customer lifetime value', 'churn prediction',
  'market basket analysis', 'recommendation engine', 'personalization', 'segmentation',
  'targeting', 'positioning', 'differentiation', 'competitive advantage',
  'value proposition', 'unique selling proposition', 'brand equity', 'brand awareness',
  'brand loyalty', 'brand preference', 'brand recognition', 'brand recall',
  'brand association', 'brand personality', 'brand image', 'brand identity',
  'corporate identity', 'visual identity', 'logo design', 'typography',
  'color theory', 'graphic design', 'web design', 'user interface design',
  'user experience design', 'information architecture', 'wireframing', 'prototyping',
  'usability testing', 'accessibility', 'responsive design', 'mobile-first design',
  'progressive web app', 'single page application', 'web components', 'microservices',
  'application programming interface', 'representational state transfer', 'graphql', 'soap',
  'javascript object notation', 'extensible markup language', 'hypertext markup language',
  'cascading style sheets', 'ecmascript', 'typescript', 'jsx', 'tsx',
  'react', 'vue', 'angular', 'svelte', 'ember', 'backbone', 'jquery',
  'node.js', 'express', 'koa', 'hapi', 'fastify', 'restify', 'sails',
  'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch', 'cassandra',
  'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'gitlab', 'github',
  'aws', 'azure', 'google cloud', 'heroku', 'netlify', 'vercel', 'firebase',
  'machine learning', 'artificial intelligence', 'deep learning', 'neural networks',
  'natural language processing', 'computer vision', 'speech recognition', 'text analysis',
  'sentiment analysis', 'topic modeling', 'named entity recognition', 'part-of-speech tagging',
  'syntax parsing', 'semantic analysis', 'word embeddings', 'language models',
  'transformer', 'bert', 'gpt', 'lstm', 'cnn', 'rnn', 'svm', 'random forest',
  'gradient boosting', 'k-means clustering', 'hierarchical clustering', 'dbscan',
  'principal component analysis', 'singular value decomposition', 'factor analysis',
  'regression analysis', 'classification', 'clustering', 'dimensionality reduction',
  'feature engineering', 'feature selection', 'model selection', 'hyperparameter tuning',
  'cross-validation', 'overfitting', 'underfitting', 'bias-variance tradeoff',
  'regularization', 'dropout', 'batch normalization', 'data augmentation',
  'transfer learning', 'few-shot learning', 'zero-shot learning', 'meta-learning',
  'reinforcement learning', 'q-learning', 'policy gradient', 'actor-critic',
  'multi-agent systems', 'game theory', 'optimization', 'genetic algorithms',
  'simulated annealing', 'particle swarm optimization', 'ant colony optimization',
  'swarm intelligence', 'collective intelligence', 'crowdsourcing', 'human computation',
  'citizen science', 'open innovation', 'collaborative filtering', 'recommendation systems',
  'search engines', 'information retrieval', 'text mining', 'web mining',
  'data mining', 'knowledge discovery', 'business intelligence', 'analytics',
  'descriptive analytics', 'diagnostic analytics', 'predictive analytics', 'prescriptive analytics',
  'big data', 'data warehouse', 'data lake', 'data mart', 'data vault',
  'etl', 'elt', 'data pipeline', 'data governance', 'data quality', 'data lineage',
  'data catalog', 'metadata management', 'master data management', 'reference data',
  'transactional data', 'operational data', 'analytical data', 'historical data',
  'real-time data', 'batch processing', 'stream processing', 'event-driven architecture',
  'microservices', 'service-oriented architecture', 'event sourcing', 'cqrs',
  'domain-driven design', 'clean architecture', 'hexagonal architecture', 'onion architecture',
  'layered architecture', 'monolithic architecture', 'distributed systems', 'scalability',
  'performance', 'reliability', 'availability', 'fault tolerance', 'resilience',
  'circuit breaker', 'bulkhead pattern', 'timeout pattern', 'retry pattern',
  'idempotency', 'eventual consistency', 'strong consistency', 'acid properties',
  'base properties', 'cap theorem', 'paxos algorithm', 'raft algorithm',
  'consensus protocols', 'distributed consensus', 'byzantine fault tolerance', 'leader election',
  'load balancing', 'round-robin', 'least connections', 'ip hash', 'consistent hashing',
  'caching', 'redis', 'memcached', 'in-memory database', 'distributed cache',
  'content delivery network', 'edge computing', 'fog computing', 'cloud computing',
  'infrastructure as a service', 'platform as a service', 'software as a service',
  'function as a service', 'container as a service', 'database as a service',
  'storage as a service', 'network as a service', 'security as a service',
  'monitoring as a service', 'logging as a service', 'backup as a service',
  'disaster recovery', 'business continuity', 'high availability', 'load testing',
  'stress testing', 'performance testing', 'security testing', 'penetration testing',
  'vulnerability assessment', 'risk assessment', 'threat modeling', 'security architecture',
  'defense in depth', 'zero trust', 'identity and access management', 'single sign-on',
  'multi-factor authentication', 'biometric authentication', 'public key infrastructure',
  'digital certificates', 'ssl/tls', 'https', 'encryption', 'symmetric encryption',
  'asymmetric encryption', 'hashing', 'salting', 'key stretching', 'key derivation',
  'random number generation', 'cryptographic protocols', 'secure communication', 'vpn',
  'firewall', 'intrusion detection system', 'intrusion prevention system', 'security information',
  'event management', 'security orchestration', 'automation and response', 'threat intelligence',
  'security awareness', 'phishing simulation', 'social engineering', 'social engineering awareness',
  'security training', 'compliance', 'gdpr', 'ccpa', 'hipaa', 'sox', 'pci dss',
  'iso 27001', 'nist cybersecurity framework', 'cybersecurity maturity model', 'security controls',
  'access control', 'authentication', 'authorization', 'accounting', 'audit logging',
  'change management', 'configuration management', 'patch management', 'vulnerability management',
  'incident response', 'forensics', 'digital forensics', 'computer forensics', 'network forensics',
  'memory forensics', 'disk forensics', 'mobile forensics', 'cloud forensics', 'iot forensics',
  'internet of things', 'smart devices', 'wearable technology', 'connected cars', 'smart homes',
  'industrial internet', 'industry 4.0', 'digital twin', 'cyber-physical systems', 'edge devices',
  'gateway devices', 'sensor networks', 'wireless sensor networks', 'mesh networks', 'ad hoc networks',
  'mobile ad hoc networks', 'vehicular ad hoc networks', 'flying ad hoc networks', 'underwater networks',
  'satellite networks', 'cellular networks', '5g networks', '6g networks', 'wifi networks',
  'bluetooth networks', 'zigbee networks', 'lorawan networks', 'nb-iot networks', 'sigfox networks',
  'low-power wide-area networks', 'short-range networks', 'personal area networks', 'local area networks',
  'wide area networks', 'metropolitan area networks', 'campus area networks', 'storage area networks',
  'virtual private networks', 'software-defined networks', 'network function virtualization', 'network slicing',
  'network automation', 'network orchestration', 'network monitoring', 'network performance', 'network security',
  'network management', 'network administration', 'network engineering', 'network architecture', 'network design',
  'network topology', 'network protocols', 'tcp/ip', 'udp', 'http', 'https', 'ftp', 'smtp', 'pop3', 'imap',
  'dns', 'dhcp', 'arp', 'icmp', 'igmp', 'ospf', 'bgp', 'rip', 'eigrp', 'isis', 'mpls', 'vlan', 'vxlan',
  'gre tunneling', 'ipsec', 'openvpn', 'wireguard', 'ssh', 'telnet', 'snmp', 'syslog', 'ntp', 'ldap',
  'kerberos', 'radius', 'tacacs+', 'netflow', 'sflow', 'ipfix', 'netconf', 'restconf', 'yang', 'grpc',
  'protobuf', 'avro', 'thrift', 'json-rpc', 'xml-rpc', 'soap', 'graphql', 'websocket', 'server-sent events',
  'webhook', 'api gateway', 'service mesh', 'sidecar proxy', 'envoy proxy', 'istio', 'linkerd', 'consul',
  'etcd', 'zookeeper', 'redis cluster', 'mongodb cluster', 'postgresql cluster', 'mysql cluster',
  'kubernetes cluster', 'docker swarm', 'mesos', 'nomad', 'terraform', 'ansible', 'chef', 'puppet',
  'saltstack', 'jenkins', 'gitlab ci', 'github actions', 'circleci', 'travis ci', 'bamboo', 'teamcity',
  'azure devops', 'aws codebuild', 'google cloud build', 'heroku pipelines', 'netlify build', 'vercel build',
  'firebase hosting', 'aws s3', 'azure blob storage', 'google cloud storage', 'minio', 'ceph', 'glusterfs',
  'nfs', 'smb', 'iscsi', 'fc', 'fcoe', 'nvme', 'nvme-of', 'rdma', 'roce', 'iwarp', 'dpdk', 'ovs-dpdk',
  'vpp', 'fd.io', 'dpdk-ans', 'dpdk-vpp', 'dpdk-ovs', 'dpdk-spp', 'dpdk-pktgen', 'dpdk-testpmd',
  'dpdk-l3fwd', 'dpdk-l2fwd', 'dpdk-l3fwd-power', 'dpdk-l3fwd-acl', 'dpdk-l3fwd-vlan', 'dpdk-l3fwd-mpls',
  'dpdk-l3fwd-gre', 'dpdk-l3fwd-vxlan', 'dpdk-l3fwd-geneve', 'dpdk-l3fwd-nvgre', 'dpdk-l3fwd-vxlan-gpe',
  'dpdk-l3fwd-mpls-gre', 'dpdk-l3fwd-mpls-vxlan', 'dpdk-l3fwd-mpls-geneve', 'dpdk-l3fwd-mpls-nvgre',
  'dpdk-l3fwd-mpls-vxlan-gpe', 'dpdk-l3fwd-mpls-gre-vxlan', 'dpdk-l3fwd-mpls-gre-geneve', 'dpdk-l3fwd-mpls-gre-nvgre',
  'dpdk-l3fwd-mpls-gre-vxlan-gpe', 'dpdk-l3fwd-mpls-vxlan-geneve', 'dpdk-l3fwd-mpls-vxlan-nvgre',
  'dpdk-l3fwd-mpls-vxlan-gpe-geneve', 'dpdk-l3fwd-mpls-vxlan-gpe-nvgre', 'dpdk-l3fwd-mpls-geneve-nvgre',
  'dpdk-l3fwd-mpls-geneve-vxlan-gpe', 'dpdk-l3fwd-mpls-nvgre-vxlan-gpe', 'dpdk-l3fwd-mpls-vxlan-gpe-geneve-nvgre'
];

// ML Classification Functions
function extractFeatures(text) {
  const features = {
    length: text.length,
    hasUrl: /https?:\/\/[^\s]+/.test(text),
    hasPhone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text),
    hasEmail: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text),
    hasCurrency: /\$[\d,]+(\.\d{2})?/.test(text),
    hasUrgency: /\b(urgent|immediate|now|asap|quick|fast|hurry|limited|expires?|deadline)\b/i.test(text),
    hasThreat: /\b(suspended|blocked|locked|terminated|deleted|removed|banned|penalty|fine|jail|arrest|warrant)\b/i.test(text),
    hasReward: /\b(free|gift|prize|won|winner|congratulations|claim|reward|bonus|discount|offer|deal)\b/i.test(text),
    hasAuthority: /\b(government|irs|fbi|police|court|legal|official|security|bank|paypal|amazon|apple|microsoft)\b/i.test(text),
    hasAction: /\b(click|verify|confirm|update|login|password|account|secure|protect|defend|guard|shield)\b/i.test(text),
    hasSuspiciousDomain: false,
    keywordMatches: 0
  };

  // Check for suspicious domains
  if (features.hasUrl) {
    const urlMatch = text.match(/https?:\/\/([^\/\s]+)/);
    if (urlMatch) {
      const domain = urlMatch[1].toLowerCase();
      features.hasSuspiciousDomain = PHISHING_URLS.some(phishDomain => 
        domain.includes(phishDomain) || domain.includes(phishDomain.replace(/-/g, ''))
      );
    }
  }

  // Count keyword matches
  features.keywordMatches = SPAM_KEYWORDS.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  ).length;

  return features;
}

function calculateRiskScore(features) {
  let score = 0;
  
  // Base score from length (longer messages might be more suspicious)
  if (features.length > 200) score += 10;
  else if (features.length > 100) score += 5;
  
  // URL presence
  if (features.hasUrl) score += 15;
  
  // Phone/Email presence
  if (features.hasPhone) score += 10;
  if (features.hasEmail) score += 10;
  
  // Currency mentions
  if (features.hasCurrency) score += 15;
  
  // Urgency indicators
  if (features.hasUrgency) score += 20;
  
  // Threat indicators
  if (features.hasThreat) score += 25;
  
  // Reward indicators
  if (features.hasReward) score += 15;
  
  // Authority mentions
  if (features.hasAuthority) score += 20;
  
  // Action words
  if (features.hasAction) score += 15;
  
  // Suspicious domain
  if (features.hasSuspiciousDomain) score += 40;
  
  // Keyword matches
  score += features.keywordMatches * 5;
  
  // Normalize to 0-100 scale
  return Math.min(100, Math.max(0, score));
}

function classifyRisk(riskScore) {
  if (riskScore >= 70) return 'scam';
  if (riskScore >= 40) return 'suspicious';
  return 'safe';
}

function findSimilarSubmissions(text, existingSubmissions) {
  const similarities = [];
  const textLower = text.toLowerCase();
  
  existingSubmissions.forEach(sub => {
    if (sub.text) {
      const similarity = stringSimilarity.compareTwoStrings(textLower, sub.text.toLowerCase());
      if (similarity > 0.3) { // 30% similarity threshold
        similarities.push({
          submissionId: sub.id,
          similarity: similarity,
          text: sub.text
        });
      }
    }
  });
  
  return similarities.sort((a, b) => b.similarity - a.similarity);
}

// API Endpoints
app.post('/api/submit', async (req, res) => {
  try {
    const { text, type = 'message' } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Extract features and calculate risk score
    const features = extractFeatures(text);
    const riskScore = calculateRiskScore(features);
    const riskCategory = classifyRisk(riskScore);
    
    // Generate unique ID
    const submissionId = uuidv4();
    const timestamp = new Date();
    
    // Get existing submissions for similarity analysis
    const submissionsSnapshot = await db.collection('submissions').get();
    const existingSubmissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      text: doc.data().text
    }));
    
    // Find similar submissions
    const similarSubmissions = findSimilarSubmissions(text, existingSubmissions);
    
    // Create submission document
    const submissionData = {
      id: submissionId,
      text: text.trim(),
      type,
      riskScore,
      riskCategory,
      features,
      timestamp: admin.firestore.Timestamp.fromDate(timestamp),
      similarSubmissions: similarSubmissions.map(s => s.submissionId)
    };
    
    // Store in submissions collection
    await db.collection('submissions').doc(submissionId).set(submissionData);
    
    // Create or update node
    const nodeData = {
      id: submissionId,
      label: text.length > 50 ? text.substring(0, 50) + '...' : text,
      riskScore,
      riskCategory,
      type,
      timestamp: admin.firestore.Timestamp.fromDate(timestamp)
    };
    
    await db.collection('nodes').doc(submissionId).set(nodeData);
    
    // Create edges for similar submissions
    const edges = [];
    similarSubmissions.forEach(similar => {
      edges.push({
        id: `${submissionId}-${similar.submissionId}`,
        source: submissionId,
        target: similar.submissionId,
        weight: similar.similarity,
        type: 'similarity'
      });
    });
    
    // Store edges
    for (const edge of edges) {
      await db.collection('edges').doc(edge.id).set(edge);
    }
    
    res.json({
      success: true,
      submission: submissionData,
      node: nodeData,
      edges: edges,
      message: `Submission classified as ${riskCategory} with risk score ${riskScore}`
    });
    
  } catch (error) {
    console.error('Error submitting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/graph', async (req, res) => {
  try {
    // Get all nodes
    const nodesSnapshot = await db.collection('nodes').get();
    const nodes = nodesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get all edges
    const edgesSnapshot = await db.collection('edges').get();
    const edges = edgesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      nodes,
      edges
    });
    
  } catch (error) {
    console.error('Error fetching graph:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const submissionsSnapshot = await db.collection('submissions')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(submissions);
    
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Scammer Detection Backend running on port ${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   POST /api/submit - Submit new URL/message for analysis`);
  console.log(`   GET  /api/graph - Get network graph data`);
  console.log(`   GET  /api/submissions - Get recent submissions`);
  console.log(`   GET  /api/health - Health check`);
});
