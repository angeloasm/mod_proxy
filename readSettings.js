
/*
Module for the read setting 
*/
module.exports ={
    readfile: function(){
        var dataFile;
        dataFile=fs.readFileSync('./settings.json', 'utf8');
        
        return dataFile;
    },
    writeSettingsFile: function(strcontent){

        fs.writeFileSync('./settings.json',strcontent, "utf-8");

    }
}


