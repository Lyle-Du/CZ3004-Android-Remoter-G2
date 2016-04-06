/**
 * Created by Zhou on 2/29/16.
 */
angular.module('starter.services')
.factory("ConverMapString",function(){

  HEXtoArray = function (char) {
    v = parseInt(char,16);
    return [
      v & 8 , v & 4, v & 2, v &1
    ]
  };

  return {
    /**
     *
     */
    convert : function (data) {
      console.log(data);
      var allData = [];
      for (var i = 0; i < data.length; i++){
        allData = allData.concat(HEXtoArray(data[i]));
      }

      var finalArray = new Array(20);
      var index = 0;
      for (var i = 0; i < 20; i++){
        finalArray[i] = new Array(15);
        for (var j = 0; j < 15; j++){
          finalArray[i][j] = allData[index] ? 1 : 0 ;
          index ++;

        }
      }
      return finalArray
    },
    convert_offset2 : function (data) {
      console.log(data);
      var allData = [];
      for (var i = 0; i < data.length; i++){
        allData = allData.concat(HEXtoArray(data[i]));
      }

      var finalArray = new Array(20);
      var index = 2;
      for (var i = 0; i < 20; i++){
        finalArray[i] = new Array(15);
        for (var j = 0; j < 15; j++){
          finalArray[i][j] = allData[index] ? 1 : 0 ;
          index ++;
        }
      }
      return finalArray
    },
    convert_blk : function (data,map) {

      var allData = [];
      for (var i = 0; i < data.length; i++){
        allData = allData.concat(HEXtoArray(data[i]));
      }

      var finalArray = map;
      console.log(finalArray);
      var index = 0;
      for (var i = 0; i < 20; i++){
        for (var j = 0; j < 15; j++){
          if (finalArray[i][j]==1){
            finalArray[i][j] = allData[index] ? 1 : 2 ;
            index++
          }

        }
      }
      return finalArray
    }
  }
}
);
