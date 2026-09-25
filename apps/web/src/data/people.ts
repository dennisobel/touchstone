import type { Organisation, Person } from './types'

// All people and organisations are fictional (UI design prompts, shared sample data).
export const people: Person[] = [
  // SSD
  { id: 'kevin', name: 'Kevin Omondi', role: 'Deal and verification analyst', org: 'ssd', location: 'Nairobi', email: 'kevin.omondi@ssd.example', phone: '+254 712 000 481', hue: 212 },
  { id: 'sarah', name: 'Sarah Mitchell', role: 'Chief compliance officer', org: 'ssd', location: 'Washington DC', email: 'sarah.mitchell@ssd.example', hue: 280 },
  { id: 'james', name: 'James Whitfield', role: 'Managing partner', org: 'ssd', location: 'Houston', email: 'james.whitfield@ssd.example', hue: 25 },
  { id: 'aisha', name: 'Aisha Hassan', role: 'Platform operations lead', org: 'ssd', location: 'Nairobi', email: 'aisha.hassan@ssd.example', hue: 160 },
  { id: 'mercy', name: 'Mercy Achieng', role: 'Verification analyst', org: 'ssd', location: 'Nairobi', email: 'mercy.achieng@ssd.example', hue: 330 },
  { id: 'counsel', name: 'Daniel Price', role: 'Outside securities counsel', org: 'counsel', location: 'New York', hue: 200 },

  // Verification network
  { id: 'brian', name: 'Brian Kiptoo', role: 'Field geologist', org: 'network', location: 'Eldoret', phone: '+254 722 000 915', credential: 'GSK member 2231', credentialBody: 'Geological Society of Kenya', credentialExpiry: '2027-03-31', hue: 100 },
  { id: 'nomvula', name: 'Dr Nomvula Dlamini', role: 'Resource geologist, Qualified Person', org: 'network', location: 'Johannesburg', credential: 'Pr.Sci.Nat. 400187/06', credentialBody: 'SACNASP', credentialExpiry: '2027-06-30', hue: 300 },
  { id: 'wanjiru', name: 'Wanjiru Kamau', role: 'Mining lawyer, Advocate of the High Court of Kenya', org: 'network', location: 'Nairobi', credential: 'P.105/7741/12', credentialBody: 'Law Society of Kenya', credentialExpiry: '2026-12-31', hue: 12 },
  { id: 'faith', name: 'Faith Njeri', role: 'ESG and community specialist', org: 'network', location: 'Nairobi', credential: 'EIA/Audit expert 8841', credentialBody: 'NEMA', credentialExpiry: '2027-01-31', hue: 140 },
  { id: 'amani', name: 'Dr Amani Mushi', role: 'Resource geologist', org: 'network', location: 'Dar es Salaam', credential: 'MAusIMM 322910', credentialBody: 'AusIMM', credentialExpiry: '2026-11-30', hue: 250 },
  { id: 'esther', name: 'Esther Wambui', role: 'Mining lawyer', org: 'network', location: 'Nairobi', credential: 'P.105/9920/15', credentialBody: 'Law Society of Kenya', credentialExpiry: '2026-12-31', hue: 45 },
  { id: 'collins', name: 'Collins Otieno', role: 'Field verifier', org: 'network', location: 'Kisumu', credential: 'GSK member 2874', credentialBody: 'Geological Society of Kenya', credentialExpiry: '2027-02-28', hue: 190 },
  { id: 'halima', name: 'Halima Abdi', role: 'Field verifier', org: 'network', location: 'Mombasa', credential: 'GSK member 3102', credentialBody: 'Geological Society of Kenya', credentialExpiry: '2026-10-15', hue: 350 },

  // Supply side
  { id: 'peter', name: 'Peter Ouma', role: 'Licence holder', org: 'ouma', location: 'Migori', phone: '+254 701 000 227', hue: 30 },
  { id: 'grace', name: 'Grace Wanjiku', role: 'CEO, Kiboko Minerals Ltd', org: 'kiboko', location: 'Nairobi', phone: '+254 733 000 614', email: 'grace@kiboko.example', hue: 320 },
  { id: 'ali', name: 'Ali Juma', role: 'Authorised representative', org: 'juma-consult', location: 'Mombasa', phone: '+254 710 000 552', hue: 60 },
  { id: 'salim', name: 'Salim Mwinyi', role: 'Director, Mawe Mekundu Resources Ltd', org: 'mawe', location: 'Kwale', hue: 5 },
  { id: 'samuel', name: 'Samuel Otieno', role: "Owner's Competent Person", org: 'kiboko', credential: 'MAusIMM 318842', credentialBody: 'AusIMM', hue: 230 },
  { id: 'joseph', name: 'Joseph Mwangi', role: 'Site manager, Kiboko Ridge', org: 'kiboko', phone: '+254 725 000 118', hue: 80 },
  { id: 'amina', name: 'Amina Yusuf', role: 'CEO, Galana Graphite Ltd', org: 'galana-co', location: 'Mombasa', hue: 290 },
  { id: 'omar', name: 'Omar Said', role: 'Managing director, Pwani Sands Ltd', org: 'pwani-co', location: 'Kwale', hue: 185 },
  { id: 'wekesa', name: 'David Wekesa', role: 'Director, Shear Zone Gold Ltd', org: 'kakamega-co', location: 'Kakamega', hue: 45 },
  { id: 'mwanajuma', name: 'Mwanajuma Mwakio', role: 'Chair, Tsavo Gem Cooperative', org: 'tsavo-co', location: 'Voi', hue: 10 },
  { id: 'musyoka', name: 'Ruth Musyoka', role: 'Director, Mutomo Iron Ltd', org: 'mutomo-co', location: 'Kitui', hue: 120 },
  { id: 'ekal', name: 'John Ekal', role: 'Director, Turkana Copper Ltd', org: 'lodwar-co', location: 'Lodwar', hue: 20 },

  // Demand side
  { id: 'rachel', name: 'Rachel Kim', role: 'Director of strategic sourcing', org: 'brightwater', location: 'Atlanta', email: 'rachel.kim@brightwater.example', hue: 205 },
  { id: 'marcus', name: 'Marcus Bell', role: 'Vice president', org: 'cedar-peak', location: 'Denver', email: 'marcus.bell@cedarpeak.example', hue: 175 },
  { id: 'linda', name: 'Linda Hargrove', role: 'Principal', org: 'hargrove', location: 'Houston', email: 'linda@hargrove.example', hue: 35 },
  { id: 'tom', name: 'Tom Nguyen', role: 'Independent mining consultant', org: 'cedar-peak', location: 'Reno', email: 'tom@nguyenmining.example', hue: 265 },
  { id: 'priya', name: 'Priya Raman', role: 'Associate', org: 'cedar-peak', location: 'Denver', email: 'priya.raman@cedarpeak.example', hue: 150 },
  { id: 'owen', name: 'Owen Clarke', role: 'Partner', org: 'summit', location: 'Chicago', email: 'owen@summitridge.example', hue: 220 },
]

export const organisations: Organisation[] = [
  { id: 'ssd', name: 'SSD', type: 'ssd', country: 'US' },
  { id: 'counsel', name: 'Hale Rowan LLP', type: 'counsel', country: 'US' },
  { id: 'ouma', name: 'Peter Ouma (sole holder)', type: 'holder', country: 'KE' },
  { id: 'kiboko', name: 'Kiboko Minerals Ltd', type: 'holder', country: 'KE' },
  { id: 'mawe', name: 'Mawe Mekundu Resources Ltd', type: 'holder', country: 'KE' },
  { id: 'juma-consult', name: 'Juma Mining Consult', type: 'consultancy', country: 'KE' },
  { id: 'galana-co', name: 'Galana Graphite Ltd', type: 'holder', country: 'KE' },
  { id: 'pwani-co', name: 'Pwani Sands Ltd', type: 'holder', country: 'KE' },
  { id: 'kakamega-co', name: 'Shear Zone Gold Ltd', type: 'holder', country: 'KE' },
  { id: 'tsavo-co', name: 'Tsavo Gem Cooperative', type: 'holder', country: 'KE' },
  { id: 'mutomo-co', name: 'Mutomo Iron Ltd', type: 'holder', country: 'KE' },
  { id: 'lodwar-co', name: 'Turkana Copper Ltd', type: 'holder', country: 'KE' },
  { id: 'brightwater', name: 'Brightwater Anode Co.', type: 'investor', country: 'US' },
  { id: 'cedar-peak', name: 'Cedar Peak Minerals Fund', type: 'investor', country: 'US' },
  { id: 'hargrove', name: 'Hargrove Family Office', type: 'investor', country: 'US' },
  { id: 'summit', name: 'Summit Ridge Capital', type: 'investor', country: 'US' },
  { id: 'northgate', name: 'Northgate Royalty Partners', type: 'investor', country: 'US' },
  { id: 'lakeshore', name: 'Lakeshore Battery Metals', type: 'investor', country: 'US' },
]

const byId = new Map(people.map((p) => [p.id, p]))
export function person(id: string): Person {
  return byId.get(id) ?? { id, name: id, role: '', org: '', hue: 210 }
}
export function org(id: string) {
  return organisations.find((o) => o.id === id)
}
