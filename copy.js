const path = require('path')
const util = require('util');
const fs = require('fs')
const yargs = require('yargs')
const {version} = require('./package.json'); 
const readdir = util.promisify(fs.readdir);
const access = util.promisify(fs.access);
const copyFile = util.promisify(fs.copyFile);
const rename = util.promisify(fs.rename);
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const rmdir = util.promisify(fs.rmdir);

const argv = yargs
    .usage('Usage: node $0 [options...]')
    .version(version)
    .alias('version', 'v')
    .help('help')
    .alias('help', 'h')
    .example("node index.js -i source_dir [-o destination_dir] [-d]")
    .option('input', {
        alias: 'i',
        describe: 'Path to input folder',
        required: true
    })
    .option('output', {
        alias: 'o',
        describe: 'Path to output folder',
        default: './output'
    })
    .option('delete', {
        alias: 'd',
        describe: 'should be source directory deleted?',
        type: 'boolean',
        default: false
    }) 
    .argv

const config = {
    path: {
        input: path.normalize(path.join(__dirname, argv.input)),
        output: path.normalize(path.join(__dirname, argv.output))
    },
    shouldDelete: argv.delete
}

const base = config.path.input;
const dest = config.path.output;
const flag = config.shouldDelete;

const copy = async function(from, to) {
    let files = await readdir(from)
    files.forEach(async (item) => {
    let localbase = path.join(from, item)
    let stats = await stat(localbase)
    if (stats.isDirectory()) {
        copy(localbase, to)
    }
    else {
        let properties = path.parse(item)
        let endDir = path.join(to,properties.name[0].toUpperCase())
        try{
        await mkdir(endDir)
        let endFile = path.join(endDir,`${properties.name}COPY${properties.ext}`)
        if (flag) {
            await rename(localbase,endFile)
            }
        else {
            await copyFile(localbase,endFile)
            }
        }
        catch (err){
                return
            }
    }
    })
    return files
}
    
access(dest)
.catch((err) => {
    mkdir(dest)
    .catch((err) => {
        process.exit(err)
    })
})
copy(base, dest)
.then(() => {
    if (flag) {
        rmdir(base, {recursive: true})
        console.log('Success and folder was deleted')
    }
    else {
        console.log('Success')
    }
})
.catch((err) => {
    process.exit(err)
})
       
process.on('unhandledRejection', (reason, p) => {
    console.log('UnhandledRejection at:', p, 'reason: ', reason)
})
