/**
 * Central Institute Configuration for Career Heights ERP
 * Single source of truth for institution identity, contact numbers, addresses,
 * branch listings, and fee parameters.
 * 
 * NOTE: Values that are unverified or unavailable (e.g., registration numbers,
 * social links, statutory seals) are NOT invented.
 */
export const INSTITUTE_CONFIG = {
  name: 'Career Heights Coaching Classes & Academic Institute',
  shortName: 'Career Heights',
  tagline: 'Premier Coaching Institute for NEET, JEE & Foundation',
  code: 'CH-ERP',
  networkName: 'Kashmir Educational Network',

  headOffice: {
    title: 'Handwara Central Campus (Head Office)',
    shortTitle: 'Handwara HQ',
    address: 'Campus Tower, Main Chowk, Handwara, J&K',
    phone: '+91 94190 12001',
    alternatePhone: '+91 94190 12002',
    email: 'contact@careerheights.demo',
    accountsEmail: 'accounts@careerheights.demo',
    operatingHours: 'Monday to Saturday, 08:30 AM to 05:00 PM',
    pincode: '193221',
  },

  contact: {
    helpline: '+91 94190 12001',
    supportPhone: '+91 94190 12002',
    email: 'contact@careerheights.demo',
    accountsEmail: 'accounts@careerheights.demo',
    website: 'https://careerheights.demo',
  },

  // Official statutory information: Do NOT invent unverified government registration numbers
  registration: {
    registrationNumber: null, // Unverified in demo dataset
    registrationStatus: 'Subject to formal statutory verification',
    affiliations: ['Jammu & Kashmir Academic Network Standards'],
    sealType: 'Institutional Academic Seal (Demo)',
  },

  // Social links: Null when unverified; do not invent fake accounts
  socialLinks: {
    facebook: null,
    twitter: null,
    instagram: null,
    youtube: null,
  },

  officialText: {
    disclaimer: 'Career Heights ERP is currently operating in prototype demonstration mode. External telecom, bank, and persistent database adapters are staged for future backend integration.',
    copyright: `© ${new Date().getFullYear()} Career Heights Coaching Classes. All rights reserved. (Jammu & Kashmir).`,
    auditNotice: 'Demo Audit Trail records actions in local browser state. Non-repudiation and backend persistence pending server deployment.',
  },

  branches: [
    {
      id: 'b-hdw',
      name: 'Handwara Campus (HQ)',
      shortName: 'Handwara',
      city: 'Handwara',
      district: 'Kupwara',
      address: 'Campus Tower, Main Chowk, Handwara, J&K',
      phone: '+91 94190 12001',
      email: 'handwara@careerheights.demo',
      headFaculty: 'Dr. Ghulam Mohammad Lone',
      isHq: true,
    },
    {
      id: 'b-qzb',
      name: 'Qaziabad Campus',
      shortName: 'Qaziabad',
      city: 'Qaziabad',
      district: 'Kupwara',
      address: 'Main Bazaar Road, Near Tehsil Office, Qaziabad, J&K',
      phone: '+91 94190 22002',
      email: 'qaziabad@careerheights.demo',
      headFaculty: 'Prof. Sana Mir',
      isHq: false,
    },
    {
      id: 'b-dgw',
      name: 'Dangiwacha Campus',
      shortName: 'Dangiwacha',
      city: 'Dangiwacha',
      district: 'Baramulla',
      address: 'Hospital Link Road, Dangiwacha, Rafiabad, Baramulla, J&K',
      phone: '+91 94190 22003',
      email: 'dangiwacha@careerheights.demo',
      headFaculty: 'Prof. Farooq Ahmad Wani',
      isHq: false,
    },
    {
      id: 'b-klb',
      name: 'Kalambad Campus',
      shortName: 'Kalambad',
      city: 'Kalambad / Kralpora',
      district: 'Kupwara',
      address: 'Chowk Complex, Kralpora-Kalambad Axis, Kupwara, J&K',
      phone: '+91 94190 22004',
      email: 'kalambad@careerheights.demo',
      headFaculty: 'Prof. Tariq Ahmad Bhat',
      isHq: false,
    },
    {
      id: 'b-uns',
      name: 'Unisoo Campus',
      shortName: 'Unisoo',
      city: 'Unisoo',
      district: 'Kupwara',
      address: 'National Highway Crossing, Unisoo Junction, Handwara, J&K',
      phone: '+91 94190 22005',
      email: 'unso@careerheights.demo',
      headFaculty: 'Er. Waseem Lone',
      isHq: false,
    },
  ],

  feeConfig: {
    currency: 'INR',
    currencySymbol: '₹',
    supportedPaymentMethods: [
      'Cash',
      'UPI',
      'Bank Transfer / NEFT',
      'Cheque',
      'Card',
      'Other',
    ],
    defaultFeeComponents: [
      'Admission & Registration Fee',
      'Term 1 Tuition Installment',
      'Term 2 Mid-Session Installment',
      'Final Exam Preparation Installment',
      'Study Material & Test Series Module',
    ],
  },
};

