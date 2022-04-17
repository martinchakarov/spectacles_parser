const { promises: fs } = require("fs");
const fss = require("fs");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const regexPatterns = {
    field: /===.*===/g,
    lookML: /LookML: https:\/\/.*/g,
    testSQL: /Test SQL: .*/g
};

let id = 1;
let output = 'ID|Field|Error|LookML|TestSQL';

console.log(`
🕶️    Spectacles Log Parser version 0.1    🕶️

Hello there, thank you for using the Spectacles Log Parser!

  `);

readline.question(`To begin, please specify the relative path to the file you wish to parse.\n\nPath ➡️    `, (name) => {
    let path = name;

    try {
        if (fss.existsSync(path)) {
            console.log(`\nThanks!`);
        }
      } catch(err) {
        console.log('\n' + err);
      }

    readline.close();

    (async() => {
        try {
            let data = await fs.readFile(path, 'utf-8');

            console.log('\nAnalyzing Spectacles logs...');

            data = data.toString().split('\n\n').slice(3);
        
            let field = '';
            let error = '';
            let lookML = '';
            let testSQL = '';

            data.forEach(line => {
                if (regexPatterns.field.test(line)) {
                    line = line.replace(/=/g, '').trim();
                    line = line.replace(//g, '');
                    field = line.replace(/\[\d*m/g, '');

                } else if (regexPatterns.lookML.test(line)) {
                    lookML = line.replace('LookML: ', '');
                } else if (regexPatterns.testSQL.test(line)) {
                    testSQL = line.replace('Test SQL: ', '');
                    error = error.replace(/\n/g, ' ')
                    
                    output += `\n${id}|${field}|${error}|${lookML}|${testSQL}`;
                    
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
            let outputFile = `output/results_${date.getFullYear()}${date.getMonth()}${date.getDate()}_${date.getHours()}${date.getMinutes()}${date.getSeconds()}.csv`;
            
            await fs.writeFile(outputFile, result, 'utf-8');
            console.log(`
✔️  Done! Your results have been saved to ${__dirname}/output/${outputFile}
            
Happy debugging! 😎\n`)

        } catch (err) {
            console.error(err);
        }
    })();

});