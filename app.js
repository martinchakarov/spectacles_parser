const { promises: fs } = require("fs");
const fss = require("fs");
const resolve = require('path').resolve;
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const regexPatterns = {
    field: /=* \[\d+m.*\[\d+m =*/g,
    lookML: /LookML: https:\/\/.*/g,
    testSQL: /Test SQL: .*/g
};
let path;
let delimiter;
let id = 1;
let output;

let totalUniqueErrors = new Set();
let totalDimensions = 0;

console.log(`
🕶️    Spectacles Log Parser version 0.1    🕶️

Hello there, thank you for using the Spectacles Log Parser!

  `);

  const pathQuestion = () => {
    return new Promise((resolve, reject) => {
        rl.question(`To begin, please specify the relative path to the file you wish to parse.\nPath  ➡️      `, (answer) => {
            path = answer;
            try {
                if (fss.existsSync(path)) {
                    console.log(`\nThanks!`);
                }
              } catch(err) {
                console.log('\n' + err);
              }
            resolve();
      });
    });
  }

  const delimiterQuestion = () => {
    return new Promise((resolve, reject) => {
      rl.question('\nOne more thing: What delimiter would you like to use for your CSV file?\nDelimiter  ➡️      ', (answer) => {
        delimiter = answer;
        console.log(`\nAlrighty, we'll use "${answer}"! 😊`);
        resolve();
      })
    })
  }

    (async() => {
        try {
            await pathQuestion()
            await delimiterQuestion()
            rl.close()

            let data = await fs.readFile(path, 'utf-8');

            console.log('\nAnalyzing Spectacles logs...\n');

            data = data.toString().split('\n\n').slice(3);
        
            let field = '';
            let error = '';
            let lookML = '';
            let testSQL = '';

            output = `ID${delimiter}Field${delimiter}Error${delimiter}LookML${delimiter}TestSQL`;

            data.forEach(line => {
                if (regexPatterns.field.test(line)) {
                    line = line.replace(/=/g, '').trim();
                    line = line.replace(//g, '');
                    field = line.replace(/\[\d*m/g, '');

                } else if (regexPatterns.lookML.test(line)) {
                    lookML = line.replace('LookML: ', '');
                } else if (regexPatterns.testSQL.test(line)) {
                    testSQL = line.replace('Test SQL: ', '');
                    error = error.replace(/\n/g, ' ');

                    totalUniqueErrors.add(error.trim());
                    totalDimensions++;
                    
                    output += `\n${id}${delimiter}${field}${delimiter}${error}${delimiter}${lookML}${delimiter}${testSQL}`;
                    
                    field = '';
                    error = '';
                    lookML = '';
                    testSQL = '';
                    id++;

                } else {
                    error += line;
                }
            });

            let result = output;

            let date = new Date(Date.now());
            let outputFile = `output/${createFilename()}`;
            let outputPath = resolve(`./output/${outputFile}`);

            await fs.writeFile(outputFile, result, 'utf-8');
            console.log(`✔️  Done! Your results have been saved to ${outputPath}\n`);

            console.table({"Total Dimensions Affected": totalDimensions, "Total Unique Errors": totalUniqueErrors.size});

            console.log(`\nHappy debugging! 😎\n`)


        } catch (err) {
            console.error(err);
        }
    })();

    function createFilename() {
      let currentDate = new Date(Date.now())
  
      let dateString = currentDate.toLocaleTimeString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
      });
  
      let [day, month, year] = dateString.slice(0, 10).split('/');
  
      let [hour, minute, second] = dateString.slice(dateString.indexOf(',')+2).split(':');
  
      return `results_${year}${month}${day}_${hour}${minute}${second}.csv`
    }