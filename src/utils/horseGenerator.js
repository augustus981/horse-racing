const horseNames = [
  'Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton', 'Joan Clarke',
  'Lightning Bolt', 'Thunder Strike', 'Storm Chaser', 'Wind Runner',
  'Fire Blaze', 'Star Dancer', 'Moon Walker', 'Sun Rider',
  'Ocean Wave', 'Mountain Peak', 'Desert Wind', 'Forest Spirit',
  'Golden Arrow', 'Silver Bullet', 'Bronze Medal', 'Diamond Dust'
]

const horseColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#10AC84', '#EE5A24', '#0abde3', '#c44569', '#ff6348',
  '#1dd1a1', '#ff3838', '#2f3542', '#40407a', '#706fd3'
]

export function generateHorses(count = 20) {
  const horses = []
  
  for (let i = 0; i < count; i++) {
    horses.push({
      id: i + 1,
      name: horseNames[i],
      condition: Math.floor(Math.random() * 100) + 1, // 1-100
      color: horseColors[i],
      totalRaces: 0,
      wins: 0,
      winRate: 0
    })
  }
  
  return horses
}

export function generateHorseNames() {
  return horseNames
}
