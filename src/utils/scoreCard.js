const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

async function generateScoreCard(userName, score, rank) {
  try {
    // Create directory for storing images if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Set canvas dimensions
    const width = 1280;
    const height = 720;
    
    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill background with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Add border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Format the current date
    const currentDate = moment().format('Do MMMM YY');
    
    // Set title
    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText('Score Card', width / 2, 100);
    
    // Set username
    ctx.font = 'bold 48px Arial';
    ctx.fillText(userName, width / 2, 200);
    
    // Set rank, score and date
    ctx.font = '36px Arial';
    ctx.fillText(`Rank: ${rank}`, width / 2, 300);
    ctx.fillText(`Score: ${score}`, width / 2, 400);
    ctx.fillText(`Date: ${currentDate}`, width / 2, 500);
    
    // Generate unique filename
    const fileName = `scorecard_${uuidv4()}.jpg`;
    const filePath = path.join(uploadDir, fileName);
    
    // Save image to file
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(filePath, buffer);
    
    // Return relative path
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error generating score card:', error);
    // Fallback to returning JSON if image generation fails
    const currentDate = moment().format('Do MMMM YY');
    
    return {
      userName: userName,
      rank: rank,
      score: score,
      date: currentDate,
      id: uuidv4(),
      error: error.message,
      fallback: true
    };
  }
}

module.exports = {
  generateScoreCard
}; 