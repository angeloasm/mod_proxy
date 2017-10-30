
/*
Module for the read setting 
*/
module.exports ={
    readfile: function(){
        var dataFile;
        dataFile=fs.readFileSync('./settings.json', 'utf8');
        
        return dataFile;
    }
   
}