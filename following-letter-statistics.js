const fs = require('fs');
const readline = require('readline');

if (process.argv.length < 4) {
  console.error('Example: node statistics-counter.js filename.txt letter');
  process.exit(1);
}

const filePath = process.argv[2];
const letter = process.argv[3]

if (letter.length !== 1 || !letter.match(/[a-z]/i)) {
  console.error('The letter argument should be a single alphabet character.');
  process.exit(1);
}
function processChar (line, letter, alphabet) {
  line = line.toLowerCase().replace(/[^a-zA-Z\s]/g, '');
  let nextChar;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === letter) {
      nextChar = line[i + 1];
    } else if (line[i] === letter && i + 1 === line.length) {
      nextChar = ' ';
    }

    if (nextChar !== undefined) {
      if (nextChar in alphabet) {
        alphabet[nextChar]++;
      } else {
        alphabet[nextChar] = 1;
      }
    }
  }
}

function countStatistics (alphabet) {
  let sum = Object.values(alphabet).reduce((acc, current) => acc + current, 0);

  if (' ' in alphabet) {
    alphabet['space'] = alphabet[' '];
    delete alphabet[' ']
  }

  const statistics = [];

  for (const [char, count] of Object.entries(alphabet)) {
    let percentage = (count / sum * 100);
    let formattedPercentage;
    if ( percentage < 0.01 ) {
      const factor = 1000;
      formattedPercentage = Math.ceil(percentage * factor) / factor;
    } else {
      formattedPercentage = percentage.toFixed(2)
    }
    statistics.push({char: char, percentage: formattedPercentage})
  }

  statistics.sort((a, b) => b.percentage - a.percentage)

  const formattedStatistics = {};
  statistics.forEach(stat => {
    formattedStatistics[stat.char] = stat.percentage + '%';
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
      processChar(line, letter, alphabet);
  });

  readInterface.on('close', function() {
    countStatistics(alphabet);
  });
});
