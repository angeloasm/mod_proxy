
/**
 * Module for the read setting 
 */
module.exports ={
    /**
     * This method of this module, read the settings file.
     * Return the full content of the file.
     */
    readfile: function(){
        var dataFile;
        dataFile=fs.readFileSync('./settings.json', 'utf8'); 
        return dataFile;
    }, 
    /**
     * This method of this module, write the settings file.
     */
    writeSettingsFile: function(strcontent){
        fs.writeFileSync('./settings.json',strcontent, "utf-8");
    }
}


