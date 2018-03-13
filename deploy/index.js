let fs = require('fs-extra');
let yaml = require('js-yaml');
let walk = require('klaw-sync')
let path = require('path');
let frontmatter = require('front-matter');
let _ = require('lodash');
let chai = require('chai');
chai.use(require('chai-fs'));
let expect = chai.expect;
let parseSRT = require('parse-srt');
let sharp = require('sharp');

describe('Docs Build',function(){

    describe('Specification',function(){

        let spec = null;
        it('spec.yaml is valid',function(cb){

            // console.log("Checking Spec")                
            // load spec
            let raw = fs.readFileSync(__dirname + '/../course/config/spec.yaml');
            spec = yaml.safeLoad(raw);
            cb();
            // console.log('✔ spec.yaml');
        });

        it ('hubs.yaml is valid',function(cb){
            // load hubs
            raw = fs.readFileSync(__dirname + '/../course/config/hubs.yaml');
            let ff = yaml.safeLoad(raw);
            cb();
        });

        it ('questions.yaml is valid',function(cb){
            //langs:
            let files = fs.readdirSync(__dirname + '/../course/config/questions');
            for (let f of files)
            {
                raw = fs.readFileSync(__dirname + '/../course/config/questions/' + f);
                let ff = yaml.safeLoad(raw);
                
            }
            cb();
        });

        it ('all files exist',function(cb){
            // console.log(spec);
            for (let lang of spec.langs)
            {
                expect(__dirname + '/../course/content/' + lang + '/' + spec.about).to.be.a.file();
                expect(__dirname + '/../course/content/' + lang + '/' + spec.info).to.be.a.file();
             
                for (let klass of spec.classes)
                {
                    for (let content of klass.content)
                    {
                        if (content.url)
                            expect(__dirname + '/../course/content/' + lang + '/' + klass.dir + '/' + content.url).to.be.a.file();
                    }
                }
            }
            cb();
        });

        it ('should have uniqe slugs in a class',function(cb){
            let class_slugs = _.map(spec.classes,'slug');
            expect(_.uniq(class_slugs)).to.have.length.of(_.size(class_slugs));

            for (let klass of spec.classes)
            {
                let slugs = _.map(klass.content,'slug');
                // console.log(slugs);
                // console.log(_.uniq(slugs));
                // console.log(_.without(slugs,undefined));
                
                expect(_.without(_.uniq(slugs),undefined)).to.have.length.of(_.size(_.without(slugs,undefined)));
            }
            cb();
        });

        it ('should have all emails',function(cb){
            let emails = ['intro.md'];
            for (let lang of spec.langs)
            {
                for (let email of emails)
                {
                    expect(__dirname + '/../course/content/' + lang + '/emails/' + email).to.be.a.file();

                    let raw = fs.readFileSync(__dirname + '/../course/content/' + lang + '/emails/' + email);
                    let ff = frontmatter(raw.toString());
                    expect(ff.attributes).to.haveOwnProperty('title');
                }
            }
            cb();
        });
    });


    let domain = 'https://' + fs.readFileSync('CNAME');

    // console.log("Replacing Links")

    describe('Build Chain',function(){
        
        let paths = walk(__dirname + '/../course/content/',{nodir: true, ignore: 'media', filter: (p)=>{
            if (_.endsWith(p.path,'.jpg') || _.endsWith(p.path,'.png') || _.endsWith(p.path,'.jpeg'))
                return false;
            else
                return true;
        }});

        let images = walk(__dirname + '/../course/content/',{nodir: true, filter: (p)=>{
            if (_.endsWith(p.path,'.jpg') || _.endsWith(p.path,'.png') || _.endsWith(p.path,'.jpeg'))
                return true;
            else
                return false;
        }});

        it ('should resize all images',async function(){
            // Find / Replace assets in the content:
            for (let p of images)
            {
                // fs.copySync(p.path,p.path+'.original',{overwrite:false});
                let filename = path.basename(p.path);
                let pp = path.dirname(p.path);
                // await sharp(p.path+'.original').resize(1024,768).max().toFile(p.path);
                await fs.ensureDir(path.join(pp,'thumb'));
                await fs.ensureDir(path.join(pp,'small'));
                await fs.ensureDir(path.join(pp,'medium'));
                await fs.ensureDir(path.join(pp,'large'));
                
                await sharp(p.path).resize(120,120).crop().jpeg().toFile(path.join(pp,'thumb',filename));
                await sharp(p.path).resize(240).max().jpeg({quality:60}).toFile(path.join(pp,'small', filename));
                await sharp(p.path).resize(480).max().jpeg().toFile(path.join(pp,'medium', filename));
                await sharp(p.path).resize(1200).max().jpeg().toFile(path.join(pp,'large', filename));

            }
        }).timeout(50000);;

        it ('should replace all links',function(cb){
            // Find / Replace assets in the content:
            for (let p of paths)
            {
                if (path.extname(p.path)=='.md')
                {
                    let contents = fs.readFileSync(p.path).toString();
                    contents = contents.replace(/{{site\.baseurl}}/g,domain);
                    fs.writeFileSync(p.path, contents);
                }
            }
            cb();
        });

        it ('should generate JSON subtitles',function(cb){
            // Find / Replace assets in the content:
            for (let p of paths)
            {
                if (path.extname(p.path)=='.srt')
                {
                   let contents = fs.readFileSync(p.path).toString();
                   var jsonSubs = parseSRT(contents);
                   fs.writeFileSync(p.path.replace('.srt','.json'), JSON.stringify(jsonSubs));
                }

            }
            cb();
        });

        it ('should generate links.jsonp',function(cb){
            let links = [];
            for (let p of paths)
            {
                if (path.extname(p.path) == '.md')
                {
                    // console.log(p);
                    let pa = path.dirname(p.path).split(path.sep)
                    let klass = pa.pop();
                    let lang = pa.pop();
                    let fm = {
                        attributes:{
                            title: klass + "-" + lang + "-" + path.basename(p.path)
                        }
                    };
                    try
                    {
                        // console.log(p.path);
                        fm = frontmatter(fs.readFileSync(p.path).toString());
                    }
                    catch (e)
                    {
                        // console.log(e)
                    }

                    // let paths = walk(__dirname + '/../course/content/',{nodir: true, ignore: 'media'});
                    // console.log(path.normalize(__dirname + '/../course/content/'));
                    // console.log(p.path.replace(path.normalize(__dirname + '/../course/content/'),'').substring(2));
                    

                    links.push({
                        text: "[" + klass + "] " + fm.attributes.title + " (" + lang + ")",
                        href:p.path.replace(path.normalize(__dirname + '/../course/content/'),'').substring(2).split(path.sep).join('/')
                    });
                }
            }
            fs.writeFileSync('links.jsonp',"callback(" + JSON.stringify(links) + ")");
            cb();
        });
    });
});
