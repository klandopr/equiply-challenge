export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { coordinates } = req.body;

    if (!coordinates || coordinates.length < 2) {
      return res.status(400).json({ error: 'At least 2 coordinates required' });
    }

    // Sort by timestamp
    const sorted = [...coordinates].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate total distance (sum of Euclidean distances between consecutive points)
    let totalDistance = 0;
    for (let i = 1; i < sorted.length; i++) {
      const dx = sorted[i].x - sorted[i - 1].x;
      const dy = sorted[i].y - sorted[i - 1].y;
      const dz = sorted[i].z - sorted[i - 1].z;
      totalDistance += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    // Calculate time elapsed
    const timeElapsed = sorted[sorted.length - 1].timestamp - sorted[0].timestamp;

    // Calculate speed (distance / time)
    const speed = timeElapsed > 0 ? totalDistance / timeElapsed : 0;

    // Calculate velocity vector (end - start) / time
    const velocity = {
      x: timeElapsed > 0 ? (sorted[sorted.length - 1].x - sorted[0].x) / timeElapsed : 0,
      y: timeElapsed > 0 ? (sorted[sorted.length - 1].y - sorted[0].y) / timeElapsed : 0,
      z: timeElapsed > 0 ? (sorted[sorted.length - 1].z - sorted[0].z) / timeElapsed : 0
    };

    // Round to 2 decimal places
    const round = (n) => Math.round(n * 100) / 100;

    return res.status(200).json({
      distance: round(totalDistance),
      speed: round(speed),
      velocity: {
        x: round(velocity.x),
        y: round(velocity.y),
        z: round(velocity.z)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
