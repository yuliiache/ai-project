const fs = require('fs');
const readline = require('readline');

if (process.argv.length < 3) {
  console.error('Example: node statistics-counter.js filename.txt');
  process.exit(1);
}

const filePath = process.argv[2];

function processChar (char, alphabet) {
  if (char in alphabet) {
    alphabet[char]++;
  } else {
    alphabet[char] = 1;
  }
}

function countStatistics (alphabet) {
  let sum = Object.values(alphabet).reduce((acc, current) => acc + current, 0);
  const statistics = [];
  for (const [letter, count] of Object.entries(alphabet)) {
    let percentage = (count / sum * 100).toFixed(2);
    statistics.push({letter: letter, percentage: percentage})
  }

  statistics.sort((a, b) => b.percentage - a.percentage)

  const formattedStatistics = {};
  statistics.forEach(stat => {
    formattedStatistics[stat.letter] = stat.percentage + '%';
  });
  console.log(formattedStatistics)
}

const alphabet = {};

fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK, (err) => {
  if (err) {
    console.error('Error accessing the file:', err);
    return;
  }

  const fileStream = fs.createReadStream(filePath);

  fileStream.on('error', function(err) {
    console.error('Error reading the file:', err)
  });

  const readInterface = readline.createInterface({
    input: fileStream,
    console: false
  });

  readInterface.on('line', function(line) {
    line.toLowerCase().replace(/[^a-z]/g, '').split('').forEach(char => {
      processChar(char, alphabet);
    });
  });

  readInterface.on('close', function() {
    countStatistics(alphabet);
  });
});

