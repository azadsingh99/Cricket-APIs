const { pool } = require('../config/db');
const { generateScoreCard } = require('../utils/scoreCard');
const moment = require('moment');

// Save score API
const saveScore = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const userId = req.user.id;
    const { score } = req.body;
    
    if (score < 50 || score > 500) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Score must be between 50 and 500'
      });
    }
    
    const today = moment().format('YYYY-MM-DD');
    const [scoreCount] = await connection.query(
      'SELECT COUNT(*) as count FROM scores WHERE user_id = ? AND DATE(created_at) = ?',
      [userId, today]
    );
    
    if (scoreCount[0].count >= 3) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 scores can be submitted per day'
      });
    }
    
    await connection.query(
      'INSERT INTO scores (user_id, score) VALUES (?, ?)',
      [userId, score]
    );
    
    await connection.commit();
    
    return res.status(201).json({
      success: true,
      message: 'Score saved successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Save score error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save score'
    });
  } finally {
    connection.release();
  }
};

// Get score card API
const getScoreCard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await pool.query(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const userName = users[0].name;
    
    // Check if user has any scores
    const [scoreExists] = await pool.query(
      'SELECT COUNT(*) as count FROM scores WHERE user_id = ?',
      [userId]
    );
    
    // If no scores, default rank to "N/A" or similar
    if (scoreExists[0].count === 0) {
      // Create a scorecard with 0 score and "N/A" rank
      const result = await generateScoreCard(userName, 0, "N/A");
      
      if (typeof result === 'string') {
        return res.status(200).json({
          success: true,
          imageUrl: result
        });
      } else {
        return res.status(200).json({
          success: true,
          scoreCard: result,
          message: 'Image generation failed, returning data instead'
        });
      }
      
      return;
    }
    
    // Get the total score
    const [scoreResult] = await pool.query(
      'SELECT SUM(score) as totalScore FROM scores WHERE user_id = ?',
      [userId]
    );
    
    const totalScore = scoreResult[0].totalScore || 0;
    
    const [rankResult] = await pool.query(`
      SELECT count(*) as user_rank FROM (
        SELECT user_id, SUM(score) as total 
        FROM scores 
        GROUP BY user_id 
        HAVING total > ?
      ) as higher_scores
    `, [totalScore]);
    
    const rank = rankResult[0].user_rank + 1;
    
    // Generate score card - this will try to create an image and fall back to JSON if it fails
    const result = await generateScoreCard(userName, totalScore, rank);
    
    // Check if the result is a string (image path) or an object (JSON fallback)
    if (typeof result === 'string') {
      return res.status(200).json({
        success: true,
        imageUrl: result
      });
    } else {
      return res.status(200).json({
        success: true,
        scoreCard: result,
        message: 'Image generation failed, returning data instead'
      });
    }
  } catch (error) {
    console.error('Get score card error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate score card'
    });
  }
};

// Get weekly scores API
const getWeeklyScores = async (req, res) => {
  try {
    const userId = req.user.id;
    
    
    const referenceDate = '2023-04-21';
    
    const [weeklyData] = await pool.query(`
      SELECT 
        FLOOR(DATEDIFF(created_at, ?) / 7) + 1 as weekNo,
        SUM(score) as totalScore
      FROM scores
      WHERE user_id = ?
      GROUP BY weekNo
      ORDER BY weekNo ASC
    `, [referenceDate, userId]);
    
    const weeks = [];
    
    for (const week of weeklyData) {
      const [rankResult] = await pool.query(`
        SELECT COUNT(*) as user_rank FROM (
          SELECT 
            s.user_id,
            SUM(s.score) as total 
          FROM scores s
          WHERE FLOOR(DATEDIFF(s.created_at, ?) / 7) + 1 = ?
          GROUP BY s.user_id
          HAVING total > ?
        ) as higher_scores
      `, [referenceDate, week.weekNo, week.totalScore]);
      
      const rank = rankResult[0].user_rank + 1;
      
      weeks.push({
        weekNo: week.weekNo,
        rank: rank,
        totalScore: week.totalScore
      });
    }
    
    return res.status(200).json({
      success: true,
      weeks: weeks
    });
  } catch (error) {
    console.error('Get weekly scores error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve weekly scores'
    });
  }
};

module.exports = {
  saveScore,
  getScoreCard,
  getWeeklyScores
}; 