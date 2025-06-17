const path = require('path');
const fs = require('fs');

module.exports = {
    getPath: () => path.join(__dirname, 'dist'),
    setConfig: (json) => fs.writeFileSync(path.join(__dirname, 'dist','config.js'), json, "utf8")
};
