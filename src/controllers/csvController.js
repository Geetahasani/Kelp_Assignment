const User = require('../models/userModel');
const { parseCSV } = require('../services/csvParser');
const sequelize = require('../config/db');

/**
 * Generates the age distribution report.
 * Returns the report data and also prints to console.
 */
const generateAgeDistributionReport = async () => {
  try {
    const result = await User.findAll({
      attributes: [
        [
          sequelize.literal(`CASE
            WHEN "age" < 20 THEN '< 20'
            WHEN "age" >= 20 AND "age" <= 40 THEN '20 to 40'
            WHEN "age" > 40 AND "age" <= 60 THEN '40 to 60'
            WHEN "age" > 60 THEN '> 60'
            END`), 
          'age_group'
        ],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['age_group'],
    });

    const totalUsers = await User.count();
    if (totalUsers === 0) {
      console.log('No user data to report.');
      return null;
    }

    const distributionMap = {
      '< 20': 0,
      '20 to 40': 0,
      '40 to 60': 0,
      '> 60': 0,
    };

    result.forEach(row => {
      const ageGroup = row.get('age_group');
      const count = parseInt(row.get('count'), 10);
      if (distributionMap.hasOwnProperty(ageGroup)) {
        distributionMap[ageGroup] = parseFloat((count / totalUsers) * 100).toFixed(2);
      }
    });

    console.log('\n--- Age Distribution Report ---');
    console.log('"Age-Group","% Distribution"');
    console.log(`"< 20","${distributionMap['< 20']}"`);
    console.log(`"20 to 40","${distributionMap['20 to 40']}"`);
    console.log(`"40 to 60","${distributionMap['40 to 60']}"`);
    console.log(`"> 60","${distributionMap['> 60']}"`);
    console.log('---------------------------------\n');

    return {
      ageDistribution: [
        { ageGroup: '< 20', distribution: distributionMap['< 20'] },
        { ageGroup: '20 to 40', distribution: distributionMap['20 to 40'] },
        { ageGroup: '40 to 60', distribution: distributionMap['40 to 60'] },
        { ageGroup: '> 60', distribution: distributionMap['> 60'] }
      ]
    };

  } catch (err) {
    console.error('Error generating age distribution report:', err);
    throw err;
  }
};

/**
 * Controller to trigger the CSV upload and processing.
 */
/**
 * Controller to trigger the CSV upload and processing.
 */
const uploadCSV = async (req, res) => {
  try {
    console.log('CSV processing triggered...');

    const records = await parseCSV();

    if (!records || records.length === 0) {
      console.log('No records found in CSV file.');
      return res.status(400).json({ 
        message: 'No records found in CSV file.' 
      });
    }

    const usersToCreate = records.map(record => {
      const { name, age, address, ...additional_info } = record;
      
      const fullName = (name && name.firstName && name.lastName) 
        ? `${name.firstName} ${name.lastName}` 
        : 'N/A';
        
      return {
        name: fullName,
        age: age,
        address: address || null,
        additional_info: additional_info || null
      };
    });

    await User.bulkCreate(usersToCreate);
    
    console.log(`Successfully uploaded ${usersToCreate.length} records.`);

    const reportData = await generateAgeDistributionReport();

    // Return simple format with just message and distribution
    return res.status(200).json({
      message: "Data uploaded & processed",
      distribution: {
        "<20": reportData.ageDistribution[0].distribution,
        "20-40": reportData.ageDistribution[1].distribution,
        "40-60": reportData.ageDistribution[2].distribution,
        ">60": reportData.ageDistribution[3].distribution
      }
    });

  } catch (err) {
    console.error('Error uploading CSV:', err);
    return res.status(500).json({ 
      error: `Error uploading CSV data: ${err.message}` 
    });
  }
};

/**
 * Controller to preview parsed CSV data without uploading to database.
 * Returns the raw JSON structure with nested properties.
 */
const previewCSV = async (req, res) => {
  try {
    console.log('CSV preview triggered...');

    const records = await parseCSV();

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No records found in CSV file.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'CSV parsed successfully',
      totalRecords: records.length,
      records: records
    });

  } catch (err) {
    console.error('Error previewing CSV:', err);
    return res.status(500).json({
      success: false,
      error: `Error previewing CSV data: ${err.message}`
    });
  }
};

module.exports = { uploadCSV, previewCSV };