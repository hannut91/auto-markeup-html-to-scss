var fs = require('fs');
var cheerio = require('cheerio');
var _ = require('lodash');
var re = /([a-zA-Z0-9:.>&,\(\)#-\/]+\s*)+[a-zA-Z0-9:.>&,\(\)#-\/]+|[a-zA-Z0-9:.>&,\(\)#-\/]+/;
var contentRegex = /([a-zA-Z0-9:.>&,\(\)-;\$'"\/_%#!+~]+\s*)+[a-zA-Z0-9:.>&,\(\)-;\$'"\/+_%#!+~]+/g;
// var htmlFile = '/Users/yoon/applicat/Appzet/appzetmobile/src/app/components/app-footer/app-footer.component.html';
// var scssFile = '/Users/yoon/applicat/Appzet/appzetmobile/src/app/components/app-footer/app-footer.component.scss';
var htmlFile = process.argv[2];
var scssFile = process.argv[3];
var htmlObjs = '';
function copyScss(htmlData) {
  var $ = cheerio.load(htmlData, {
    decodeEntities: false,
    ignoreWhitespace: false
  });

  var childList = $.root().children();

  var validTags = [];

  for (var i = 0; i < childList.length; i++) {
    removeNone(childList[i]);
  }

  function removeNone(child) {
    if ((typeof child.attribs == 'object') && (typeof child.attribs.id == 'string')) {
      validTags.push(child);
    } else  if ((typeof child.attribs == 'object') && (typeof child.attribs.class == 'string')) {
      validTags.push(child);
    } else {
      if (child.children && child.children.length > 0) {
        for (var j = 0; j < child.children.length; j++) {
          removeNone(child.children[j]);
        }
      }
    }
  }

  if(validTags.length < 1){
    console.log('HTML tag is not exist');
    return;
  }
  var resultList = [];

  for (var i = 0; i < validTags.length; i++) {
    var result = getClass(validTags[i]);

    if (JSON.stringify(result) != '{}') {
      resultList.push(result);
    }
  }

  function getClass(child) {
    if (child.children && child.children.length > 0) {
      var dataList = [];
      for (var i = 0; i < child.children.length; i++) {
        var data = getClass(child.children[i]);
        if (JSON.stringify(data) != '{}') {
          if (data.class) {
            dataList.push(data);
          } else {
            for (var j = 0; j < data.child.length; j++) {
              dataList.push(data.child[j]);
            }
          }
        }
      }

      var nestedList = [];
      for (var i = 0; i < dataList.length; i++) {
        var index = _.findIndex(nestedList, function (data) {
          return data.class == dataList[i].class;
        });

        if (index < 0) {
          nestedList.push(dataList[i]);
        } else {
          nestedList[index].child = nestedList[index].child.concat(dataList[i].child);
        }
      }

      if ((typeof child.attribs == 'object') && (typeof child.attribs.id == 'string')) {
        if ((typeof child.attribs == 'object') && (typeof child.attribs.class == 'string')) {
          return {
            class: "#" + child.attribs.id,
            child: [{
              class: child.attribs.class,
              child: nestedList
            }]
          }
        } else {
          return {
            class: "#" + child.attribs.id,
            child: nestedList
          }
        }
      } else if ((typeof child.attribs == 'object') && (typeof child.attribs.class == 'string')) {
        return {
          class: child.attribs.class,
          child: nestedList
        }
      } else {
        return {
          class: '',
          child: nestedList
        }
      }
    } else {
      if ((typeof child.attribs == 'object') && (typeof child.attribs.id == 'string')) {
        if ((typeof child.attribs == 'object') && (typeof child.attribs.class == 'string')) {
          return {
            class: child.attribs.id,
            child: [{
              class: child.attribs.class,
              child: []
            }]
          }
        } else {
          return {
            class: "#" + child.attribs.id,
            child: []
          };
        }
      } else if ((typeof child.attribs == 'object') && (typeof child.attribs.class == 'string')) {
        return {
          class: child.attribs.class,
          child: []
        }
      } else {
        return {};
      }
    }
  }

  var scssList = [];

  for (var i = 0; i < resultList.length; i++) {
    var finded = false;
    for (var j = 0; j < scssList.length; j++) {
      var data = find(resultList[i], scssList[j]);
      if (data) {
        finded = data;
        break;
      }
    }
    if (!finded) {
      scssList.push(resultList[i]);
    }
  }

  function find(target, resource) {
    if (target.class == resource.class) {
      if (target.child.length == 0 && resource.child.length == 0) {
        return true;
      } else if (target.child.length == 0 && resource.child.length > 0) {
        return true;
      } else if (target.child.length > 0 && resource.child.length == 0) {
        resource.child = target.child;
        return true;
      } else if (target.child.length > 0 && resource.child.length > 0) {
        var isConcatList = [];
        var concatList = [];
        for (var i = 0; i < target.child.length; i++) {
          for (var j = 0; j < resource.child.length; j++) {
            isConcatList.push(find(target.child[i], resource.child[j]));
          }
          if(isConcatList.indexOf(true) == -1){
            concatList.push(target.child[i]);
          }
          isConcatList = [];
        }
        resource.child = resource.child.concat(concatList);
        return true;
      }
    } else {
      return false;
    }
  }

  for (var i = 0; i < scssList.length; i++) {
    printResult(scssList[i]);
  }

  htmlObjs = scssList;

  function printResult(obj) {
    if(obj.class && obj.class[0] != "#"){
      obj.class = '.' + obj.class.split(" ").join(' .');
    }
    obj.content = [];
    if(obj.child.length > 0){
      for(var i = 0;i < obj.child.length; i++ ){
        printResult(obj.child[i]);
      }
    }
  }
}


var htmlData = fs.readFileSync(htmlFile).toString();
var data = fs.readFileSync(scssFile).toString();
var index = 0;
var etc = [];
var objs = [];
copyScss(htmlData);
getStart();

function getStart(){
  var product = '';
  for(;index<data.length;index++){
    if(data[index] == "{"){
      objs.push({
        class: product.match(re) ? product.match(re)[0] : '',
        content: [],
        child: []
      });
      product = '';
      index++;
      getContent(objs[objs.length - 1]);
    } else if(data[index] == "}"){
    } else if(data[index] == ";"){
      product += data[index];
      etc.push(product);

      product = '';
    } else {
      product += data[index];
    }
  }
}

function getContent(obj){
  var product = '';
  for(;index<data.length;index++){
    if(data[index] == ';'){
      product += ';';
      obj.content.push(product.match(contentRegex)[0]);
      product = '';
    } else if(data[index] == '{'){
      obj.child.push({
        class: product.match(re) ? product.match(re)[0] : '',
        content: [],
        child: []
      });
      product = '';
      index++;
      getContent(obj.child[obj.child.length - 1]);
    } else if(data[index] == '}'){
      return;
    } else {
      product += data[index];
    }
  }
}


for(var i = 0;i < htmlObjs.length; i++){
  var finded = false;
  for(var j = 0;j < objs.length; j++){
    var data = find(htmlObjs[i], objs[j]);
    if (data){
      finded = data;
      break;
    }
  }

  if (!finded){
    objs.push(htmlObjs[i]);
  }
}

function find(target, resource){
  if(target.class == resource.class){
    if (target.child.length == 0 && resource.child.length == 0) {
        return true;
      } else if (target.child.length == 0 && resource.child.length > 0) {
        return true;
      } else if (target.child.length > 0 && resource.child.length == 0) {
        resource.child = target.child;
        return true;
      } else if (target.child.length > 0 && resource.child.length > 0) {
        var isConcatList = [];
        var concatList = [];
        for (var i = 0; i < target.child.length; i++) {
          for (var j = 0; j < resource.child.length; j++) {
            isConcatList.push(find(target.child[i], resource.child[j]));
          }
          if(isConcatList.indexOf(true) == -1){
            concatList.push(target.child[i]);
          }
          isConcatList = [];
        }
        resource.child = resource.child.concat(concatList);
        return true;
      }
  } else {
    return false;
  }
}

// for(var i = 0; i < objs.length; i++){
//   findNestedStart(objs[i]);
// }
//
// function findNestedStart(obj){
//   if(obj.child.length < 0) return;
//
//   for(var j = 0;j < obj.child.length; j++){
//     for(var k = j+1; k < obj.child.length; k++){
//       if(findNested(obj.child[j], obj.child[k])){
//         obj.child[j] = {
//           class: '',
//           content:'',
//           child:[]
//         }
//       }
//     }
//   }
// }
//
// function findNested(target, resource) {
//   if(target.class == resource.class){
//     if (target.child.length == 0 && resource.child.length == 0) {
//       return true;
//     } else if (target.child.length == 0 && resource.child.length > 0) {
//       return true;
//     } else if (target.child.length > 0 && resource.child.length == 0) {
//       resource.child = target.child;
//       return true;
//     } else if (target.child.length > 0 && resource.child.length > 0) {
//       var isConcatList = [];
//       var concatList = [];
//       for (var i = 0; i < target.child.length; i++) {
//         for (var j = 0; j < resource.child.length; j++) {
//           isConcatList.push(find(target.child[i], resource.child[j]));
//         }
//         if(isConcatList.indexOf(true) == -1){
//           concatList.push(target.child[i]);
//         }
//         isConcatList = [];
//       }
//       resource.child = resource.child.concat(concatList);
//       return true;
//     }
//   } else {
//     if(resource.child.length > 0){
//       for(var m = 0; m < resource.child.length; m++){
//         if(findNested(target, resource.child[m])){
//           target = {
//             class: '',
//             content: '',
//             child: []
//           }
//           return true;
//         }
//       }
//     } else {
//       return false;
//     }
//   }
// }


var resultScss = '';
var index;
for(var i =0; i < etc.length; i++){
  resultScss += etc[i];
  resultScss += '\n';
}
for(var i = 0;i < objs.length; i++){
  index = 0;
  toScss(objs[i]);
  resultScss += '\n';
}
function toScss(obj){
  if(!obj.class) return;
  for(var k = 0; k < index; k++){
    resultScss += '  ';
  }
  resultScss += obj.class + ' {\n';

  for(var m = 0;m < obj.content.length; m++){
    for(var k = 0; k < index +1 ; k++){
      resultScss += '  ';
    }
    resultScss += obj.content[m];
    resultScss += '\n';
  }
  for(var j = 0;j < obj.child.length; j++){
    index ++;
    resultScss += '\n';
    toScss(obj.child[j]);
  }
  for(var k = 0; k < index; k++){
    resultScss += '  ';
  }
  resultScss += '}\n';
  index--;

}

fs.writeFileSync(scssFile, resultScss);
