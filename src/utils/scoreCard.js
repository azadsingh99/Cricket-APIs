const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

async function generateScoreCard(userName, score, rank) {
  try {
     const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    } 

    const width = 1280;
    const height = 720;
    
    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill background with a light gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f5f5f5');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
     

    ctx.strokeStyle = '#3498db'; 
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    
    // Add a header background
    ctx.fillStyle = '#3498db';
    ctx.fillRect(20, 20, width - 40, 120);
    
    // Format the current date
    const currentDate = moment().format('Do MMMM YY');
    
    // Set title - "Score Card"
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = '#FFFFFF';  // White color for header text
    ctx.textAlign = 'center';
    ctx.fillText('Score Card', width / 2, 100);
    
    // Set username
    ctx.font = 'bold 54px Arial';
    ctx.fillStyle = '#2c3e50';  // Dark blue text
    ctx.fillText(userName, width / 2, 220);
    
    // Create a box for rank
    ctx.fillStyle = '#e74c3c';  // Red background for rank
    ctx.fillRect(width/2 - 150, 250, 300, 100);
    
    // Set rank
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#FFFFFF';  // White text for rank
    ctx.fillText(`Rank: ${rank}`, width / 2, 320);
    
    // Set score
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#2c3e50';  // Dark blue text
    ctx.fillText(`Score: ${score}`, width / 2, 450);
    
    // Set date
    ctx.font = '36px Arial';
    ctx.fillStyle = '#7f8c8d';  // Gray text for date
    ctx.fillText(`Date: ${currentDate}`, width / 2, 550);
    
    // Add decorative elements
    // Top corners
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(40, 40, 25, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width - 40, 40, 25, 0, 2 * Math.PI);
    ctx.fill();
    
    // Bottom corners
    ctx.beginPath();
    ctx.arc(40, height - 40, 25, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width - 40, height - 40, 25, 0, 2 * Math.PI);
    ctx.fill();
    
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